import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool';
import generateUsername from '../db/generateUsername';
import { createIraciRequest } from '../services/iraciService';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(
    `SELECT u.id, u.username, u.email, u.status, u.is_active,
            u.must_change_password, u.created_at,
            r.name as role,
            p.first_name, p.last_name, p.profile_status
     FROM users u
     JOIN roles r ON u.role_id = r.id
     LEFT JOIN profiles p ON u.id = p.user_id
     ORDER BY u.created_at DESC`
  );
  res.json({ users: result.rows });
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { role_name, function_ids } = req.body;

  if (!role_name) {
    res.status(400).json({ error: 'role_name est obligatoire' });
    return;
  }

  const roleResult = await pool.query(
    'SELECT id FROM roles WHERE name = $1', [role_name]
  );

  if (roleResult.rows.length === 0) {
    res.status(400).json({ error: 'Rôle invalide' });
    return;
  }

  const username = await generateUsername(role_name);
  const password = 'ChangeMe123!';
  const password_hash = await bcrypt.hash(password, 12);

  // Créer l'utilisateur
  const result = await pool.query(
    `INSERT INTO users (username, password_hash, role_id, must_change_password, status)
     VALUES ($1, $2, $3, TRUE, 'pending')
     RETURNING id, username`,
    [username, password_hash, roleResult.rows[0].id]
  );

  const userId = result.rows[0].id;

  // Créer le profil vide
  await pool.query(
    'INSERT INTO profiles (user_id, profile_status) VALUES ($1, $2)',
    [userId, 'incomplete']
  );

  // Ajouter dans user_roles
  await pool.query(
    `INSERT INTO user_roles (user_id, role_id, assigned_by)
     VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
    [userId, roleResult.rows[0].id, req.user!.id]
  );

  // Assigner les fonctions si fournies
  if (function_ids && Array.isArray(function_ids)) {
    for (const funcId of function_ids) {
      await pool.query(
        `INSERT INTO user_functions (user_id, function_id, assigned_by)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [userId, funcId, req.user!.id]
      );
    }
  }

  // Créer une requête IRACI
  await createIraciRequest({
    action_code: 'CREATE_USER',
    initiator_id: req.user!.id,
    target_user_id: userId,
    data: { role: role_name, username },
  });

  res.status(201).json({
    message: 'Utilisateur créé avec succès',
    user: { id: userId, username: result.rows[0].username },
    credentials: { username, password },
  });
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, is_active, email } = req.body;

  await pool.query(
    `UPDATE users SET
      status = COALESCE($1, status),
      is_active = COALESCE($2, is_active),
      email = COALESCE($3, email),
      updated_at = NOW()
     WHERE id = $4`,
    [status, is_active, email, id]
  );

  res.json({ message: 'Utilisateur mis à jour' });
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (id === req.user!.id) {
    res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
    return;
  }

  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  res.json({ message: 'Utilisateur supprimé' });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const password = 'ChangeMe123!';
  const password_hash = await bcrypt.hash(password, 12);

  await pool.query(
    `UPDATE users SET
      password_hash = $1,
      must_change_password = TRUE,
      status = 'pending'
     WHERE id = $2`,
    [password_hash, id]
  );

  res.json({ message: 'Mot de passe réinitialisé', temporary_password: password });
};

export const assignRole = async (req: Request, res: Response): Promise<void> => {
  const { user_id, role_name } = req.body;

  const roleResult = await pool.query(
    'SELECT id FROM roles WHERE name = $1', [role_name]
  );

  if (roleResult.rows.length === 0) {
    res.status(400).json({ error: 'Rôle invalide' });
    return;
  }

  await pool.query(
    `INSERT INTO user_roles (user_id, role_id, assigned_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, role_id)
     DO UPDATE SET is_active = TRUE, assigned_by = $3, assigned_at = NOW()`,
    [user_id, roleResult.rows[0].id, req.user!.id]
  );

  await pool.query(
    `INSERT INTO user_roles_history (user_id, role_id, action, performed_by)
     VALUES ($1, $2, 'assigned', $3)`,
    [user_id, roleResult.rows[0].id, req.user!.id]
  );

  res.json({ message: 'Rôle assigné avec succès' });
};
