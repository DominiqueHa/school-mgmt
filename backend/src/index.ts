import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pool from './db/pool';

import authRoutes from './routes/auth';
import personsRoutes from './routes/persons';
import structureRoutes from './routes/structure';
import rbacRoutes from './routes/rbac';
import usersRoutes from './routes/users';
import functionsRoutes from './routes/functions';
import profileRoutes from './routes/profile';
import iraciRoutes from './routes/iraci';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/persons', personsRoutes);
app.use('/api/structure', structureRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/functions', functionsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/iraci', iraciRoutes);

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      service: 'school-mgmt-api',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: '🎓 School Management System API v2.0 — IRACI' });
});

app.listen(PORT, () => {
  console.log(`🚀 API démarrée sur http://localhost:${PORT}`);
});
