import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool';
import generateUsername from '../db/generateUsername';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(`
    SELECT u.id, u.username, u.first_name, u.last_name,
           u.email, u.phone, u.status, u.is_active,
           u.must_change_password, u.education_level,
           u.created_at, r.name as role
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `);
  res.json({ users: result.rows });
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const {
    first_name, last_name, role_name,
    email, phone, gender, date_of_birth,
    place_of_birth, nationality, education_level,
  } = req.body;

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

  const result = await pool.query(`
    INSERT INTO users (
      username, password_hash, first_name, last_name,
      role_id, email, phone, gender, date_of_birth,
      place_of_birth, nationality, education_level,
      must_change_password, status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE,'pending')
    RETURNING id, username, first_name, last_name
  `, [
    username, password_hash, first_name, last_name,
    roleResult.rows[0].id, email || null, phone || null,
    gender || null, date_of_birth || null,
    place_of_birth || null, nationality || null,
    education_level || null,
  ]);

  res.status(201).json({
    message: 'Utilisateur créé avec succès',
    user: result.rows[0],
    credentials: { username, password },
  });
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    first_name, last_name, email, phone,
    gender, date_of_birth, place_of_birth,
    nationality, education_level, status, is_active,
  } = req.body;

  await pool.query(`
    UPDATE users SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone),
      gender = COALESCE($5, gender),
      date_of_birth = COALESCE($6, date_of_birth),
      place_of_birth = COALESCE($7, place_of_birth),
      nationality = COALESCE($8, nationality),
      education_level = COALESCE($9, education_level),
      status = COALESCE($10, status),
      is_active = COALESCE($11, is_active),
      updated_at = NOW()
    WHERE id = $12
  `, [
    first_name, last_name, email, phone,
    gender, date_of_birth, place_of_birth,
    nationality, education_level, status, is_active, id,
  ]);

  res.json({ message: 'Utilisateur mis à jour' });
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Empêcher la suppression de son propre compte
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

  await pool.query(`
    UPDATE users SET
      password_hash = $1,
      must_change_password = TRUE,
      status = 'pending'
    WHERE id = $2
  `, [password_hash, id]);

  res.json({ message: 'Mot de passe réinitialisé', temporary_password: password });
};
