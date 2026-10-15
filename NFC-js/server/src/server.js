// AirData (SIMPLE version for teaching)
// One Express file, 3 models, simple JWT. No roles, no sockets, no validators.
//
// Run:  npm run dev -w server   (needs Atlas MONGODB_URI in .env)
// Seed: npm run seed -w server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User } from './models/User.js';
import { Band } from './models/Band.js';
import { Scan } from './models/Scan.js';
import { requireLogin } from './middleware/auth.js';
import { connectCluster } from './db.js';

// Load .env from the repo root, so `npm run dev` works
// whether you run it from the root or from server/.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const rootEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
dotenv.config({ path: rootEnv });
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
// Cluster-only: paste your Atlas mongodb+srv:// string into .env as MONGODB_URI.
// (Atlas → Network Access → add your IP, or 0.0.0.0/0 for class demo.)
const MONGO_URI = process.env.MONGODB_URI || '';
const PORT = process.env.PORT || 4000;

export function createApp() {
  const app = express();

  // Allow the Vite frontend to call us.
  app.use(cors({ origin: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',') }));
  app.use(express.json());

  // Health check — open http://localhost:4000/api/health in browser.
  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // ---------- AUTH ----------

  // POST /api/auth/login  { email, password } -> { token, user }
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  });

  // GET /api/auth/me — who am I? (needs token)
  app.get('/api/auth/me', requireLogin, async (req, res) => {
    const user = await User.findById(req.user.id).select('name email');
    res.json(user);
  });

  // Everything below needs login.
  app.use('/api/bands', requireLogin);
  app.use('/api/scans', requireLogin);
  app.use('/api/stats', requireLogin);

  // ---------- BANDS ----------

  // GET /api/bands?search=nf-48  (simple search, newest first, max 100)
  app.get('/api/bands', async (req, res) => {
    const search = (req.query.search || '').trim();
    const filter = search
      ? {
          $or: [
            { bandId: { $regex: search, $options: 'i' } },
            { nfcUid: { $regex: search, $options: 'i' } },
            { holderName: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    const bands = await Band.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(bands);
  });

  // POST /api/bands  { bandId, nfcUid, holderName } — issue a new band
  app.post('/api/bands', async (req, res, next) => {
    try {
      const bandId = String(req.body.bandId || '').trim().toUpperCase();
      const nfcUid = String(req.body.nfcUid || '').trim().toUpperCase();
      const holderName = String(req.body.holderName || '').trim();
      if (!bandId || !nfcUid) return res.status(400).json({ message: 'bandId and nfcUid are required' });
      const band = await Band.create({
        bandId,
        nfcUid,
        holderName,
        status: holderName ? 'ACTIVE' : 'AVAILABLE',
      });
      res.status(201).json(band);
    } catch (e) {
      // Duplicate bandId / nfcUid lands here (unique index).
      return res.status(400).json({ message: 'Band ID or UID already exists' });
    }
  });

  // PATCH /api/bands/:id  { status: 'ACTIVE' | 'BLOCKED' } — block / unblock
  app.patch('/api/bands/:id', async (req, res) => {
    try {
      const { status } = req.body;
      if (!['ACTIVE', 'BLOCKED', 'AVAILABLE'].includes(status)) {
        return res.status(400).json({ message: 'Status must be ACTIVE, BLOCKED or AVAILABLE' });
      }
      const band = await Band.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!band) return res.status(404).json({ message: 'Band not found' });
      res.json(band);
    } catch {
      // Bad ObjectId (e.g. /bands/abc) lands here instead of crashing.
      return res.status(400).json({ message: 'Invalid band id' });
    }
  });

  // ---------- SCANS (the NFC tap) ----------

  // POST /api/scans  { nfcUid, action: 'ENTRY'|'EXIT' }
  // Looks up the band: ACTIVE -> SUCCESS, BLOCKED -> DENIED, missing -> UNKNOWN.
  app.post('/api/scans', async (req, res, next) => {
    const nfcUid = String(req.body.nfcUid || '').trim().toUpperCase();
    const action = req.body.action;
    if (!nfcUid) return res.status(400).json({ message: 'nfcUid is required' });

    const band = await Band.findOne({ nfcUid });

    let result = 'UNKNOWN';
    let holderName = '—';
    if (band) {
      holderName = band.holderName || '—';
      result = band.status === 'ACTIVE' ? 'SUCCESS' : band.status === 'BLOCKED' ? 'DENIED' : 'DENIED';
    }

    const scan = await Scan.create({
      nfcUid,
      holderName,
      action: action === 'EXIT' ? 'EXIT' : 'ENTRY',
      result,
    });
    res.status(201).json({ scan, band, result, message: result === 'SUCCESS' ? 'Access granted' : result === 'DENIED' ? 'Access denied' : 'Unknown band' });
  });

  // GET /api/scans?limit=20 — latest taps, newest first
  app.get('/api/scans', async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const scans = await Scan.find().sort({ createdAt: -1 }).limit(limit);
    res.json(scans);
  });

  // ---------- DASHBOARD NUMBERS ----------

  // GET /api/stats — 3 numbers for the KPI cards
  app.get('/api/stats', async (req, res) => {
    const totalBands = await Band.countDocuments();
    const activeBands = await Band.countDocuments({ status: 'ACTIVE' });
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const scansToday = await Scan.countDocuments({ createdAt: { $gte: startOfDay } });
    res.json({ totalBands, activeBands, scansToday });
  });

  // Safety net: unknown route -> clean JSON (not an HTML crash page).
  app.use((req, res) => res.status(404).json({ message: 'Not found: ' + req.path }));

  // Safety net: any unexpected error -> clean JSON, details in server terminal.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong, check the server terminal' });
  });

  return app;
}

// Connect + listen (only when run directly, not when imported by tests)
export async function startServer() {
  if (!MONGO_URI || !MONGO_URI.startsWith('mongodb+srv://')) {
    throw new Error('Missing MONGODB_URI: paste your Atlas cluster string (mongodb+srv://...) into .env');
  }
  await connectCluster(MONGO_URI);
  console.log('MongoDB connected:', MONGO_URI);
  const app = createApp();
  app.listen(PORT, () => console.log(`Simple API listening on http://localhost:${PORT}`));
}
