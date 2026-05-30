import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initSchema, pool } from './db';
import estimationsRouter from './routes/estimations';
import pipelineRouter from './routes/pipeline';
import masterDataRouter from './routes/masterData';
import analyticsRouter from './routes/analytics';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/estimations', estimationsRouter);
app.use('/api/pipeline', pipelineRouter);
app.use('/api/master', masterDataRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Serve built React app in production
// __dirname is server/src/ so go up two levels to repo root, then into client/dist
const staticPath = path.resolve(__dirname, '..', '..', 'client', 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(staticPath));
  app.get('*', (_req, res) => {
    const index = path.join(staticPath, 'index.html');
    res.sendFile(index);
  });
}

async function start() {
  await initSchema();
  // Auto-seed on first deploy if tables are empty
  const check = await pool.query('SELECT COUNT(*) as count FROM companies');
  if (check.rows[0].count === '0') {
    const { seed } = await import('./seed');
    await seed();
    console.log('Auto-seeded initial data');
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`));
}

start().catch(err => { console.error('Failed to start:', err); process.exit(1); });
