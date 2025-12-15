import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import { config } from './config/env';
import { getDatabase } from './config/database';
import { runMigrations, seedAchievements } from './config/migrations';
import { initMongo } from './config/mongo';
import apiRoutes from './routes';

const app: Application = express();
const PORT = config.port;

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Инициализация баз данных и запуск сервера
void (async () => {
  // SQLite (пока ещё используется для части функционала)
  getDatabase();
  runMigrations();
  seedAchievements();

  // MongoDB для новых моделей - делаем подключение опциональным
  try {
    await initMongo();
    console.log(`💾 MongoDB: ${config.database.mongoUri}/${config.database.mongoDbName}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB connection failed, continuing with SQLite only:`, error instanceof Error ? error.message : error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`💾 SQLite DB: ${config.database.path}`);
  });
})();

export default app;
