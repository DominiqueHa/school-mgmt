const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const register = async (req, res) => {
  const { email, password, first_name, last_name, role_name } = req.body;

  // Vérifier si l'email existe déjà
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }

  // Récupérer le rôle
  const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [role_name || 'student']);
  if (roleResult.rows.length === 0) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }

  // Hasher le mot de passe
  const password_hash = await bcrypt.hash(password, 12);

  // Créer l'utilisateur
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name, last_name`,
    [email, password_hash, first_name, last_name, roleResult.rows[0].id]
  );

  res.status(201).json({
    message: 'Utilisateur créé avec succès',
    user: result.rows[0],
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Récupérer l'utilisateur avec son rôle
  const result = await pool.query(
    `SELECT u.*, r.name as role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.email = $1 AND u.is_active = TRUE`,
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const user = result.rows[0];

  // Vérifier le mot de passe
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  // Générer le token JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  res.json({
    message: 'Connexion réussie',
    token,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
  });
};

const me = async (req, res) => {
  const result = await pool.query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, r.name as role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  res.json({ user: result.rows[0] });
};

module.exports = { register, login, me };
