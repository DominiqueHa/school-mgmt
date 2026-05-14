import { Request, Response } from 'express';
import pool from '../db/pool';
import { createIraciRequest } from '../services/iraciService';

export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(
    `SELECT p.*, u.username, u.email, r.name as role
     FROM profiles p
     JOIN users u ON p.user_id = u.id
     JOIN roles r ON u.role_id = r.id
     WHERE p.user_id = $1`,
    [req.user!.id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Profil introuvable' });
    return;
  }

  res.json({ profile: result.rows[0] });
};

export const completeMyProfile = async (req: Request, res: Response): Promise<void> => {
  const {
    first_name, last_name, gender, date_of_birth,
    place_of_birth, nationality, address, phone,
    id_card_number, education_level,
  } = req.body;

  if (!first_name || !last_name) {
    res.status(400).json({ error: 'Prénom et nom obligatoires' });
    return;
  }

  await pool.query(
    `INSERT INTO profiles (
      user_id, first_name, last_name, gender, date_of_birth,
      place_of_birth, nationality, address, phone,
      id_card_number, education_level,
      profile_status, submitted_at, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending_validation',NOW(),NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      first_name = $2, last_name = $3, gender = $4,
      date_of_birth = $5, place_of_birth = $6,
      nationality = $7, address = $8, phone = $9,
      id_card_number = $10, education_level = $11,
      profile_status = 'pending_validation',
      submitted_at = NOW(), updated_at = NOW()`,
    [req.user!.id, first_name, last_name, gender, date_of_birth,
     place_of_birth, nationality, address, phone,
     id_card_number, education_level]
  );

  // Mettre à jour le prénom/nom dans users aussi
  await pool.query(
    'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3',
    [first_name, last_name, req.user!.id]
  );

  // Créer une requête IRACI de validation
  await createIraciRequest({
    action_code: 'VALIDATE_PROFILE',
    initiator_id: req.user!.id,
    target_user_id: req.user!.id,
    data: { profile_completed: true },
  });

  res.json({ message: 'Profil soumis pour validation' });
};

export const getPendingProfiles = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(
    `SELECT p.*, u.username, r.name as role
     FROM profiles p
     JOIN users u ON p.user_id = u.id
     JOIN roles r ON u.role_id = r.id
     WHERE p.profile_status = 'pending_validation'
     ORDER BY p.submitted_at ASC`
  );
  res.json({ profiles: result.rows });
};

export const validateProfile = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { action, rejection_reason } = req.body;

  if (userId === req.user!.id) {
    res.status(403).json({ error: 'Auto-validation interdite' });
    return;
  }

  if (action === 'approve') {
    await pool.query(
      `UPDATE profiles SET
        profile_status = 'validated',
        validated_at = NOW(),
        validated_by = $1,
        updated_at = NOW()
       WHERE user_id = $2`,
      [req.user!.id, userId]
    );
    res.json({ message: 'Profil validé avec succès' });
  } else {
    await pool.query(
      `UPDATE profiles SET
        profile_status = 'rejected',
        rejection_reason = $1,
        validated_by = $2,
        updated_at = NOW()
       WHERE user_id = $3`,
      [rejection_reason || 'Informations incorrectes', req.user!.id, userId]
    );
    res.json({ message: 'Profil rejeté' });
  }
};

export const getProfileByUserId = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const result = await pool.query(
    `SELECT p.*, u.username, r.name as role
     FROM profiles p
     JOIN users u ON p.user_id = u.id
     JOIN roles r ON u.role_id = r.id
     WHERE p.user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Profil introuvable' });
    return;
  }

  res.json({ profile: result.rows[0] });
};
