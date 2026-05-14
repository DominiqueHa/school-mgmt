import pool from './pool';

const prefixes: Record<string, string> = {
  director: 'DIR',
  deputy_director: 'DAD',
  censor: 'CEN',
  accountant: 'ACC',
  teacher: 'TCH',
  student: 'STU',
  parent: 'PAR',
  under_admin: 'STF',
  admin: 'ADM',
};

async function generateUsername(roleName: string): Promise<string> {
  const prefix = prefixes[roleName] || 'USR';
  const year = new Date().getFullYear();

  const result = await pool.query(
    `SELECT COUNT(*) FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE r.name = $1`,
    [roleName]
  );

  const count = parseInt(result.rows[0].count) + 1;
  const num = String(count).padStart(3, '0');
  return `${prefix}-${year}-${num}`;
}

export default generateUsername;
