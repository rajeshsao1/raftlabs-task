import { Db, MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

declare global {
  // eslint-disable-next-line no-var
  var __foodhubMongoClientPromise: Promise<MongoClient> | undefined;
}

async function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (cachedClient) {
    return cachedClient;
  }

  if (!global.__foodhubMongoClientPromise) {
    const client = new MongoClient(uri);
    global.__foodhubMongoClientPromise = client.connect();
  }

  cachedClient = await global.__foodhubMongoClientPromise;
  return cachedClient;
}

export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await getClient();
  cachedDb = client.db();
  return cachedDb;
}
