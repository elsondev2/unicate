import { MongoClient, Db } from 'mongodb';
import { config } from './config.js';

const uri = config.mongodbUri;

// MongoDB connection options for better compatibility
const options = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('live-learn-hub');
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
