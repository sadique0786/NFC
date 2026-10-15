// Login page — SAME split-screen premium look, simple useState + fetch.
// No react-hook-form, no zod, no react-query.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nfc } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../auth/AuthContext';
import { Input, Button } from '../components/ui';

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();

  // 1. Form values live in simple state
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // 2. On submit: POST /api/auth/login, save token, go to dashboard
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      login(data.token, data.user);
      nav('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="premium-app-bg grid min-h-screen text-white lg:grid-cols-[1.05fr_1fr]">
      {/* Left: branding panel (desktop only) */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="premium-grid-bg absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-gradient-to-b from-[#F0D48A] via-[#D4A853] to-[#8F6A2E]">
              <Nfc size={21} className="text-[#1A1408]" />
            </span>
            <span className="leading-none">
              <span className="block text-[19px] font-bold">AirData</span>
              <span className="mt-1 block text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#D4A853]">NFC Intelligence</span>
            </span>
          </div>
          <div className="max-w-[520px]">
            <p className="eyebrow mb-5 flex items-center gap-2 text-[#D4A853]"><span className="h-px w-8 bg-[#D4A853]/60" /> Enterprise access infrastructure</p>
            <h1 className="text-[52px] font-semibold leading-[1.02] tracking-[-0.03em] xl:text-[60px]">
              Every tap,<br /><span className="font-serif italic font-normal gold-text">perfectly</span> orchestrated.
            </h1>
            <p className="mt-5 max-w-[420px] text-[15px] leading-relaxed text-white/50">
              Bands, identity and attendance — unified in one black-glass command center.
            </p>
          </div>
          <p className="text-[11.5px] text-white/30">Trusted by campuses, stadiums &amp; enterprises</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <p className="eyebrow mb-3 text-[#D4A853]">Welcome back</p>
          <h2 className="text-[30px] font-semibold leading-tight tracking-[-0.025em]">Sign in to your<br />workspace<span className="text-[#D4A853]">.</span></h2>
          <p className="mt-2.5 text-[13.5px] text-white/45">Demo login: admin@test.com / password123</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-[7px]">
              <label className="block text-[12.5px] font-semibold text-white/85">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
            </div>
            <div className="space-y-[7px]">
              <label className="block text-[12.5px] font-semibold text-white/85">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <p className="rounded-[10px] border border-red-500/20 bg-red-500/[0.08] px-3 py-2.5 text-[13px] text-red-300">{error}</p>}
            <Button type="submit" variant="gold" disabled={busy} className="w-full">
              {busy ? 'Signing in…' : 'Sign in →'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
