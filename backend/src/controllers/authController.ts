import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../db/pool';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  const result = await pool.query(
    `SELECT u.*, r.name as role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.username = $1 AND u.is_active = TRUE`,
    [username]
  );

  if (result.rows.length === 0) {
    res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
    return;
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
    return;
  }

  const signOptions: SignOptions = { expiresIn: '24h' };

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET as string,
    signOptions
  );

  res.json({
    message: 'Connexion réussie',
    token,
    must_change_password: user.must_change_password,
    user: {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      photo_url: user.photo_url,
    },
  });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(
    `SELECT u.id, u.username, u.first_name, u.last_name, u.email,
            u.phone, u.gender, u.date_of_birth, u.place_of_birth,
            u.nationality, u.address, u.id_card_number, u.photo_url,
            u.is_active, u.must_change_password, r.name as role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [req.user!.id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
    return;
  }

  res.json({ user: result.rows[0] });
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { current_password, new_password } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user!.id]);
  const user = result.rows[0];

  const valid = await bcrypt.compare(current_password, user.password_hash);
  if (!valid) {
    res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    return;
  }

  const password_hash = await bcrypt.hash(new_password, 12);
  await pool.query(
    'UPDATE users SET password_hash = $1, must_change_password = FALSE WHERE id = $2',
    [password_hash, req.user!.id]
  );

  res.json({ message: 'Mot de passe modifié avec succès' });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const {
    first_name, last_name, phone, gender,
    date_of_birth, place_of_birth, nationality,
    address, id_card_number, email,
  } = req.body;

  await pool.query(
    `UPDATE users SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone),
      gender = COALESCE($5, gender),
      date_of_birth = COALESCE($6, date_of_birth),
      place_of_birth = COALESCE($7, place_of_birth),
      nationality = COALESCE($8, nationality),
      address = COALESCE($9, address),
      id_card_number = COALESCE($10, id_card_number),
      updated_at = NOW()
     WHERE id = $11`,
    [first_name, last_name, email, phone, gender,
     date_of_birth, place_of_birth, nationality,
     address, id_card_number, req.user!.id]
  );

  res.json({ message: 'Profil mis à jour avec succès' });
};
