// Simple seed for teaching. Creates 1 login + 4 bands + a few scans.
// Login: admin@test.com / password123
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { User } from './models/User.js';
import { Band } from './models/Band.js';
import { Scan } from './models/Scan.js';
import { connectCluster } from './db.js';

// Load .env from the repo root, so `npm run seed` works from anywhere.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const rootEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
dotenv.config({ path: rootEnv });
dotenv.config();
// Cluster-only: uses the same Atlas MONGODB_URI as the server.
const MONGO_URI = process.env.MONGODB_URI || '';

export async function seedDatabase() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1 admin user
  await User.deleteMany({});
  await User.create({ name: 'Demo Admin', email: 'admin@test.com', passwordHash });

  // 4 demo bands
  await Band.deleteMany({});
  await Band.create([
    { bandId: 'NF-4821', nfcUid: '04:A3:F1:9C', holderName: 'Akshay Sharma', status: 'ACTIVE' },
    { bandId: 'NF-4822', nfcUid: '04:77:1D:4E', holderName: 'Shivam Goswami', status: 'ACTIVE' },
    { bandId: 'NF-4823', nfcUid: '04:C9:02:77', holderName: 'Aaisha', status: 'AVAILABLE' },
    { bandId: 'NF-4824', nfcUid: '04:DE:AD:BE', holderName: 'Azim Khan', status: 'BLOCKED' },
  ]);

  // 3 demo scans
  await Scan.deleteMany({});
  await Scan.create([
    { nfcUid: '04:A3:F1:9C', holderName: 'Akshay Sharma', action: 'ENTRY', result: 'SUCCESS' },
    { nfcUid: '04:77:1D:4E', holderName: 'Shivam Goswami', action: 'ENTRY', result: 'SUCCESS' },
    { nfcUid: '04:DE:AD:BE', holderName: 'Azim Khan', action: 'ENTRY', result: 'DENIED' },
  ]);

  console.log('Seeded! Login with admin@test.com / password123');
}

const isDirectRun = (process.argv[1] || '').replace(/\\/g, '/').endsWith('seed.js');
if (isDirectRun) {
  if (!MONGO_URI || !MONGO_URI.startsWith('mongodb+srv://')) {
    console.error('Missing MONGODB_URI: paste your Atlas cluster string (mongodb+srv://...) into .env');
    process.exit(1);
  }
  connectCluster(MONGO_URI)
    .then(() => seedDatabase())
    .then(() => mongoose.disconnect())
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
