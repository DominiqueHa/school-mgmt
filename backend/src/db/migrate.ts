import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pool from './pool';

async function migrate(): Promise<void> {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`⏳ Migration : ${file}`);
    await pool.query(sql);
    console.log(`✅ OK : ${file}`);
  }

  await pool.end();
  console.log('🎉 Toutes les migrations terminées');
}

migrate().catch((err: Error) => {
  console.error('❌ Erreur migration :', err.message);
  process.exit(1);
});
