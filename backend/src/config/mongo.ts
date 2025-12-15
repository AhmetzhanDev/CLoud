import { MongoClient, Db } from 'mongodb';
import { config } from './env';

let client: MongoClient | null = null;
let db: Db | null = null;

export const initMongo = async (): Promise<Db> => {
  if (db) return db;

  const uri = config.database.mongoUri;
  const dbName = config.database.mongoDbName;

  client = new MongoClient(uri, {
    connectTimeoutMS: 5000, // 5 second timeout
    serverSelectionTimeoutMS: 5000, // 5 second timeout
  });
  
  await client.connect();
  db = client.db(dbName);

  console.log(`✅ MongoDB connected: ${uri}, db=${dbName}`);
  return db;
};

export const getMongoDb = (): Db => {
  if (!db) {
    throw new Error('MongoDB is not initialized. Call initMongo() before using getMongoDb().');
  }

  return db;
};

export const closeMongo = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
};

process.on('SIGINT', () => {
  void closeMongo().finally(() => process.exit(0));
});

process.on('SIGTERM', () => {
  void closeMongo().finally(() => process.exit(0));
});


