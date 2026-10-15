// Dashboard — SAME KPI cards + live activity look, simple fetch.
// No react-query, no sockets, no charts: we poll every 10s with setInterval.
import { useEffect, useState } from 'react';
import { Nfc, BadgeCheck, ScanLine } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../auth/AuthContext';
import { Card, Badge, Loading } from '../components/ui';

// One KPI card (same premium style as before)
function Kpi({ label, value, icon: Icon, color }) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08]" style={{ background: `${color}1A`, color }}>
          <Icon size={18} />
        </span>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10.5px] font-semibold text-white/50">Live</span>
      </div>
      <p className="eyebrow mt-4 text-white/35">{label}</p>
      <p className="mt-1 font-mono text-[32px] leading-none tracking-tight text-white">{value}</p>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load numbers + recent taps. Refresh every 10 seconds (simple polling).
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [s, r] = await Promise.all([api('/stats'), api('/scans?limit=12')]);
        if (alive) { setStats(s); setScans(r); setLoading(false); }
      } catch { if (alive) setLoading(false); }
    }
    load();
    const timer = setInterval(load, 10000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  if (loading) return <Loading text="Loading dashboard…" />;

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow mb-2 flex items-center gap-2 text-[#D4A853]"><span className="h-px w-6 bg-[#D4A853]/60" /> Command center</p>
        <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-white">
          Hello, <span className="font-serif italic font-normal gold-text">{user?.name ? user.name.split(' ')[0] : 'Admin'}</span>
        </h1>
        <p className="mt-1.5 text-[13.5px] text-white/45">Here&apos;s what&apos;s happening across your NFC system.</p>
      </header>

      {/* 3 KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Total Bands" value={stats?.totalBands ?? '—'} icon={Nfc} color="#E5BE6B" />
        <Kpi label="Active Bands" value={stats?.activeBands ?? '—'} icon={BadgeCheck} color="#34D399" />
        <Kpi label="Today's Scans" value={stats?.scansToday ?? '—'} icon={ScanLine} color="#60A5FA" />
      </div>

      {/* Recent taps */}
      <Card className="p-5">
        <h2 className="text-[14.5px] font-semibold text-white">Live Activity</h2>
        <p className="mt-0.5 text-xs text-white/40">Latest taps, newest first</p>
        <ul className="mt-4 space-y-1.5">
          {scans.map((s) => (
            <li key={s._id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[13px] font-semibold text-white">{s.holderName || s.nfcUid}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-white/35">{s.nfcUid} · {s.action}</p>
              </div>
              <Badge value={s.result} />
            </li>
          ))}
          {scans.length === 0 && <p className="py-6 text-center text-[13px] text-white/40">No taps yet — go to Scanner and tap a band.</p>}
        </ul>
      </Card>
    </div>
  );
}
