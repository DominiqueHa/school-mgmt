const pool = require('../db/pool');

// ── ÉLÈVES ──────────────────────────────────────────────
const getStudents = async (req, res) => {
  const result = await pool.query(`
    SELECT s.id, s.registration_number, s.date_of_birth,
           u.first_name, u.last_name, u.email, u.is_active,
           c.name as class_name
    FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN classes c ON s.class_id = c.id
    ORDER BY u.last_name, u.first_name
  `);
  res.json({ students: result.rows });
};

const getStudentById = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(`
    SELECT s.id, s.registration_number, s.date_of_birth,
           u.first_name, u.last_name, u.email, u.is_active,
           c.name as class_name
    FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN classes c ON s.class_id = c.id
    WHERE s.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Élève introuvable' });
  }
  res.json({ student: result.rows[0] });
};

const createStudent = async (req, res) => {
  const { email, password, first_name, last_name, date_of_birth, registration_number } = req.body;
  const bcrypt = require('bcryptjs');

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }

  const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', ['student']);
  const password_hash = await bcrypt.hash(password || 'ChangeMe123!', 12);

  const userResult = await pool.query(`
    INSERT INTO users (email, password_hash, first_name, last_name, role_id)
    VALUES ($1, $2, $3, $4, $5) RETURNING id
  `, [email, password_hash, first_name, last_name, roleResult.rows[0].id]);

  const studentResult = await pool.query(`
    INSERT INTO students (user_id, registration_number, date_of_birth)
    VALUES ($1, $2, $3) RETURNING id
  `, [userResult.rows[0].id, registration_number, date_of_birth]);

  res.status(201).json({
    message: 'Élève créé avec succès',
    student_id: studentResult.rows[0].id,
  });
};

// ── ENSEIGNANTS ─────────────────────────────────────────
const getTeachers = async (req, res) => {
  const result = await pool.query(`
    SELECT t.id, t.employee_number, t.speciality, t.hire_date,
           u.first_name, u.last_name, u.email, u.is_active
    FROM teachers t
    JOIN users u ON t.user_id = u.id
    ORDER BY u.last_name, u.first_name
  `);
  res.json({ teachers: result.rows });
};

const createTeacher = async (req, res) => {
  const { email, password, first_name, last_name, speciality, hire_date, employee_number } = req.body;
  const bcrypt = require('bcryptjs');

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }

  const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', ['teacher']);
  const password_hash = await bcrypt.hash(password || 'ChangeMe123!', 12);

  const userResult = await pool.query(`
    INSERT INTO users (email, password_hash, first_name, last_name, role_id)
    VALUES ($1, $2, $3, $4, $5) RETURNING id
  `, [email, password_hash, first_name, last_name, roleResult.rows[0].id]);

  const teacherResult = await pool.query(`
    INSERT INTO teachers (user_id, employee_number, speciality, hire_date)
    VALUES ($1, $2, $3, $4) RETURNING id
  `, [userResult.rows[0].id, employee_number, speciality, hire_date]);

  res.status(201).json({
    message: 'Enseignant créé avec succès',
    teacher_id: teacherResult.rows[0].id,
  });
};

// ── STAFF ────────────────────────────────────────────────
const getStaff = async (req, res) => {
  const result = await pool.query(`
    SELECT s.id, s.employee_number, s.position, s.hire_date,
           u.first_name, u.last_name, u.email, u.is_active
    FROM staff s
    JOIN users u ON s.user_id = u.id
    ORDER BY u.last_name, u.first_name
  `);
  res.json({ staff: result.rows });
};

const createStaff = async (req, res) => {
  const { email, password, first_name, last_name, position, hire_date, employee_number } = req.body;
  const bcrypt = require('bcryptjs');

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }

  const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', ['under_admin']);
  const password_hash = await bcrypt.hash(password || 'ChangeMe123!', 12);

  const userResult = await pool.query(`
    INSERT INTO users (email, password_hash, first_name, last_name, role_id)
    VALUES ($1, $2, $3, $4, $5) RETURNING id
  `, [email, password_hash, first_name, last_name, roleResult.rows[0].id]);

  const staffResult = await pool.query(`
    INSERT INTO staff (user_id, employee_number, position, hire_date)
    VALUES ($1, $2, $3, $4) RETURNING id
  `, [userResult.rows[0].id, employee_number, position, hire_date]);

  res.status(201).json({
    message: 'Personnel créé avec succès',
    staff_id: staffResult.rows[0].id,
  });
};

module.exports = {
  getStudents, getStudentById, createStudent,
  getTeachers, createTeacher,
  getStaff, createStaff,
};
