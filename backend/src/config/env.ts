import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // SQLite-путь больше не используется, оставляем для обратной совместимости
  DATABASE_PATH: z.string().default('./data/research-assistant.db'),
  // MongoDB
  MONGO_URI: z
    .string()
    .default('mongodb://localhost:27017/research-assistant'),
  MONGO_DB_NAME: z.string().default('research-assistant'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().default('52428800'),
  ARXIV_API_URL: z.string().default('http://export.arxiv.org/api/query'),
  SEMANTIC_SCHOLAR_API_URL: z.string().default('https://api.semanticscholar.org/graph/v1'),
  OPENAI_API_KEY: z.string().optional(),
  OLLAMA_API_URL: z.string().default('http://localhost:11434'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
};

export const env = parseEnv();

export const config = {
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  cors: {
    origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
  },
  database: {
    path: env.DATABASE_PATH,
    mongoUri: env.MONGO_URI,
    mongoDbName: env.MONGO_DB_NAME,
  },
  upload: {
    dir: env.UPLOAD_DIR,
    maxFileSize: parseInt(env.MAX_FILE_SIZE, 10),
  },
  externalAPIs: {
    arxiv: env.ARXIV_API_URL,
    semanticScholar: env.SEMANTIC_SCHOLAR_API_URL,
  },
  ai: {
    openaiApiKey: env.OPENAI_API_KEY,
    ollamaApiUrl: env.OLLAMA_API_URL,
  },
};
