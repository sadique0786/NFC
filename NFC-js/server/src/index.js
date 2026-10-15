// Starts the SIMPLE teaching server (see server.js for all routes).
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { startServer } from './server.js';
import { connectCluster } from './db.js';

// server.js already loads the repo-root .env — this is a backup
// for the check below, in case index.js is run on its own.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const rootEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
dotenv.config({ path: rootEnv });
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || '';

if (!MONGO_URI || !MONGO_URI.startsWith('mongodb+srv://')) {
  console.error('Missing MONGODB_URI: paste your Atlas cluster string (mongodb+srv://...) into .env');
  process.exit(1);
}

mongoose.set('strictQuery', true);
connectCluster(MONGO_URI)
  .then(() => startServer())
  .catch((e) => {
    console.error('Could not connect to your Atlas cluster.');
    console.error('Tip: Atlas → Network Access → whitelist your IP (or 0.0.0.0/0 for class demo).');
    console.error(e.message);
    process.exit(1);
  });
