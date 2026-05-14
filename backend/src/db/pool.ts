import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connecté');
});

pool.on('error', (err: Error) => {
  console.error('❌ Erreur PostgreSQL :', err.message);
});

export default pool;
