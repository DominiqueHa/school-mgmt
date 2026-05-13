const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connecté');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL :', err.message);
  process.exit(1);
});

module.exports = pool;
