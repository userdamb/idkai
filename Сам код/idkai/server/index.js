import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import downloadRoutes from './routes/download.js';
import aiRoutes from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' })); // тело до 1мб, больше нам тут не надо

async function start() {
  // сначала поднимаем базу, потом уже принимаем запросы
  await initDb();

  // все ручки висят на /api
  app.use('/api', authRoutes);
  app.use('/api', downloadRoutes);
  app.use('/api', aiRoutes);

  app.listen(PORT, () => {
    console.log(`IDK Server running on port ${PORT}`);
  });
}

start();
