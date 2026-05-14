import { Request, Response } from 'express';
import pool from '../db/pool';

export const getSchoolYears = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM school_years ORDER BY start_date DESC');
  res.json({ school_years: result.rows });
};

export const createSchoolYear = async (req: Request, res: Response): Promise<void> => {
  const { name, start_date, end_date, is_active } = req.body;

  if (is_active) {
    await pool.query('UPDATE school_years SET is_active = FALSE');
  }

  const result = await pool.query(`
    INSERT INTO school_years (name, start_date, end_date, is_active)
    VALUES ($1, $2, $3, $4) RETURNING *
  `, [name, start_date, end_date, is_active || false]);

  res.status(201).json({ message: 'Année scolaire créée', school_year: result.rows[0] });
};

export const getClasses = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(`
    SELECT c.id, c.name, c.level, c.max_students,
           sy.name as school_year,
           COUNT(s.id) as student_count
    FROM classes c
    LEFT JOIN school_years sy ON c.school_year_id = sy.id
    LEFT JOIN students s ON s.class_id = c.id
    GROUP BY c.id, sy.name
    ORDER BY c.level, c.name
  `);
  res.json({ classes: result.rows });
};

export const createClass = async (req: Request, res: Response): Promise<void> => {
  const { name, level, school_year_id, max_students } = req.body;

  const result = await pool.query(`
    INSERT INTO classes (name, level, school_year_id, max_students)
    VALUES ($1, $2, $3, $4) RETURNING *
  `, [name, level, school_year_id, max_students || 30]);

  res.status(201).json({ message: 'Classe créée avec succès', class: result.rows[0] });
};

export const assignStudentToClass = async (req: Request, res: Response): Promise<void> => {
  const { student_id, class_id } = req.body;

  const classResult = await pool.query(`
    SELECT c.max_students, COUNT(s.id) as current
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    WHERE c.id = $1
    GROUP BY c.max_students
  `, [class_id]);

  if (classResult.rows.length === 0) {
    res.status(404).json({ error: 'Classe introuvable' });
    return;
  }

  const { max_students, current } = classResult.rows[0];
  if (parseInt(current) >= parseInt(max_students)) {
    res.status(400).json({ error: 'Classe complète' });
    return;
  }

  await pool.query('UPDATE students SET class_id = $1 WHERE id = $2', [class_id, student_id]);
  res.json({ message: 'Élève affecté à la classe avec succès' });
};

export const getSubjects = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM subjects ORDER BY name');
  res.json({ subjects: result.rows });
};

export const createSubject = async (req: Request, res: Response): Promise<void> => {
  const { name, code, coefficient } = req.body;

  const result = await pool.query(`
    INSERT INTO subjects (name, code, coefficient)
    VALUES ($1, $2, $3) RETURNING *
  `, [name, code, coefficient || 1.0]);

  res.status(201).json({ message: 'Matière créée avec succès', subject: result.rows[0] });
};
