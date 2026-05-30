import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initSchema } from './db';
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
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(staticPath));
  app.get('*', (_req, res) => res.sendFile(path.join(staticPath, 'index.html')));
}

async function start() {
  await initSchema();
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`));
}

start().catch(err => { console.error('Failed to start:', err); process.exit(1); });
