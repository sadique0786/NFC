// even though browsers work — so we retry with public DNS (8.8.8.8).
import dns from 'node:dns';
import mongoose from 'mongoose';

export async function connectCluster(uri) {
  try {
    await mongoose.connect(uri);
    return;
  } catch (e) {
    const isDnsProblem = e.message.includes('querySrv') || e.message.includes('ENOTFOUND');
    if (!isDnsProblem) throw e; // real connection/auth error — show it as-is
    console.log('System DNS refused — retrying with public DNS (8.8.8.8)…');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    await mongoose.disconnect().catch(() => {});
    await mongoose.connect(uri);
  }
}
