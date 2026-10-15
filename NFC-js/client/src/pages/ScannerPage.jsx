// Scanner page — SAME big tap card look, simple code.
// Type (or paste) a UID and press Scan. No Web-NFC / kiosk / timers.
import { useState } from 'react';
import { api } from '../lib/api';
import { Card, Button, Input, Select, PageHeader } from '../components/ui';

export function ScannerPage() {
  const [nfcUid, setNfcUid] = useState('04:A3:F1:9C');
  const [action, setAction] = useState('ENTRY');
  const [result, setResult] = useState(null); // { result, message, holderName }
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleScan(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setBusy(true);
    try {
      const data = await api('/scans', { method: 'POST', body: { nfcUid, action } });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const ok = result?.result === 'SUCCESS';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="NFC Scanner" subtitle="Type a UID (or paste from your reader) and press Scan." />

      <Card className="p-6">
        <form onSubmit={handleScan} className="flex flex-wrap gap-2">
          <div className="min-w-52 flex-1">
            <Input value={nfcUid} onChange={(e) => setNfcUid(e.target.value)} placeholder="04:A3:F1:9C" aria-label="NFC UID" />
          </div>
          <Select value={action} onChange={(e) => setAction(e.target.value)} aria-label="Action">
            <option value="ENTRY">ENTRY</option>
            <option value="EXIT">EXIT</option>
          </Select>
          <Button type="submit" variant="gold" disabled={busy || !nfcUid.trim()}>
            {busy ? 'Scanning…' : 'Scan'}
          </Button>
        </form>
        <p className="mt-3 text-xs text-white/35">Tip: seeded demo UIDs are 04:A3:F1:9C (active) and 04:DE:AD:BE (blocked).</p>
      </Card>

      {/* Result card — green = granted, red = denied */}
      {result && (
        <div className={`rounded-2xl border p-10 text-center ${ok ? 'border-green-500 bg-green-950' : 'border-red-500 bg-red-950'}`}>
          <p className={`text-3xl font-bold ${ok ? 'text-green-300' : 'text-red-300'}`}>
            {ok ? '✓ ACCESS GRANTED' : result.result === 'UNKNOWN' ? 'UNKNOWN BAND' : 'ACCESS DENIED'}
          </p>
          <p className="mt-3 font-mono text-lg text-white">{nfcUid}</p>
          <p className="mt-1 text-sm text-white/60">{result.message} · {result.scan?.holderName}</p>
          <Button variant="secondary" onClick={() => setResult(null)} className="mt-6">Scan again</Button>
        </div>
      )}
      {error && <p className="rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-center text-[13px] text-red-300">{error}</p>}

      {!result && !error && (
        <div className="premium-card rounded-3xl p-10 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-b from-[#F0D48A] to-[#8F6A2E] text-xl text-black">◉</span>
          <p className="text-[19px] font-semibold text-white">Ready to scan</p>
          <p className="mt-2 text-[13.5px] text-white/45">Enter the NFC UID above.</p>
        </div>
      )}
    </div>
  );
}
