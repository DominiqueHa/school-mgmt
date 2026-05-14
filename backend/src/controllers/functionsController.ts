import { Request, Response } from 'express';
import pool from '../db/pool';

// ── FONCTIONS ────────────────────────────────────────────

export const getFunctionsByRole = async (req: Request, res: Response): Promise<void> => {
  const { roleId } = req.params;
  const result = await pool.query(
    `SELECT f.*, r.name as role_name
     FROM functions f
     JOIN roles r ON f.role_id = r.id
     WHERE f.role_id = $1 AND f.is_active = TRUE
     ORDER BY f.label`,
    [roleId]
  );
  res.json({ functions: result.rows });
};

export const getAllFunctions = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(
    `SELECT f.*, r.name as role_name, r.id as role_id
     FROM functions f
     JOIN roles r ON f.role_id = r.id
     WHERE f.is_active = TRUE
     ORDER BY r.name, f.label`
  );
  res.json({ functions: result.rows });
};

export const createFunction = async (req: Request, res: Response): Promise<void> => {
  const { name, label, description, role_id, is_mixable, is_exclusive } = req.body;

  if (!name || !label || !role_id) {
    res.status(400).json({ error: 'name, label et role_id sont obligatoires' });
    return;
  }

  const result = await pool.query(
    `INSERT INTO functions (name, label, description, role_id, is_mixable, is_exclusive, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, label, description || null, role_id,
     is_mixable ?? true, is_exclusive ?? false, req.user!.id]
  );

  res.status(201).json({ message: 'Fonction créée', function: result.rows[0] });
};

export const updateFunction = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { label, description, is_mixable, is_exclusive, is_active } = req.body;

  await pool.query(
    `UPDATE functions SET
      label = COALESCE($1, label),
      description = COALESCE($2, description),
      is_mixable = COALESCE($3, is_mixable),
      is_exclusive = COALESCE($4, is_exclusive),
      is_active = COALESCE($5, is_active),
      updated_at = NOW()
     WHERE id = $6`,
    [label, description, is_mixable, is_exclusive, is_active, id]
  );

  res.json({ message: 'Fonction mise à jour' });
};

export const deleteFunction = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await pool.query('UPDATE functions SET is_active = FALSE WHERE id = $1', [id]);
  res.json({ message: 'Fonction désactivée' });
};

// ── FONCTIONS UTILISATEUR ────────────────────────────────

export const getUserFunctions = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const result = await pool.query(
    `SELECT f.id, f.name, f.label, f.description,
            r.name as role_name, uf.assigned_at, uf.is_active
     FROM user_functions uf
     JOIN functions f ON uf.function_id = f.id
     JOIN roles r ON f.role_id = r.id
     WHERE uf.user_id = $1 AND uf.is_active = TRUE
     ORDER BY r.name, f.label`,
    [userId]
  );
  res.json({ functions: result.rows });
};

export const assignFunction = async (req: Request, res: Response): Promise<void> => {
  const { user_id, function_id } = req.body;

  // Vérifier la règle d'exclusivité
  const funcResult = await pool.query(
    'SELECT * FROM functions WHERE id = $1', [function_id]
  );

  if (funcResult.rows.length === 0) {
    res.status(404).json({ error: 'Fonction introuvable' });
    return;
  }

  const func = funcResult.rows[0];

  if (func.is_exclusive) {
    // Vérifier qu'il n'a pas déjà une fonction exclusive dans ce rôle
    const existing = await pool.query(
      `SELECT uf.id FROM user_functions uf
       JOIN functions f ON uf.function_id = f.id
       WHERE uf.user_id = $1 AND f.role_id = $2
       AND f.is_exclusive = TRUE AND uf.is_active = TRUE`,
      [user_id, func.role_id]
    );

    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'Cet utilisateur a déjà une fonction exclusive pour ce rôle' });
      return;
    }
  }

  await pool.query(
    `INSERT INTO user_functions (user_id, function_id, assigned_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, function_id)
     DO UPDATE SET is_active = TRUE, assigned_by = $3, assigned_at = NOW()`,
    [user_id, function_id, req.user!.id]
  );

  res.json({ message: 'Fonction assignée avec succès' });
};

export const revokeFunction = async (req: Request, res: Response): Promise<void> => {
  const { user_id, function_id } = req.body;

  await pool.query(
    `UPDATE user_functions SET is_active = FALSE
     WHERE user_id = $1 AND function_id = $2`,
    [user_id, function_id]
  );

  res.json({ message: 'Fonction révoquée' });
};
