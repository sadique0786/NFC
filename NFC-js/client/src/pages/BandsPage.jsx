// Bands page — SAME table look, simple code.
// Search box + list + add-band form + block/unblock buttons.
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';
import { Badge, Button, Input, PageHeader, EmptyState, Loading } from '../components/ui';

export function BandsPage() {
  const [bands, setBands] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [listError, setListError] = useState('');

  // Add-band form state
  const [bandId, setBandId] = useState('');
  const [nfcUid, setNfcUid] = useState('');
  const [holderName, setHolderName] = useState('');
  const [formError, setFormError] = useState('');

  // Load bands (re-run when search text changes, with tiny debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api(`/bands?search=${encodeURIComponent(search)}`);
        setBands(data);
        setListError('');
      } catch (err) {
        setListError(err.message);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function refresh() {
    try {
      const data = await api(`/bands?search=${encodeURIComponent(search)}`);
      setBands(data);
      setListError('');
    } catch (err) {
      setListError(err.message);
    }
  }

  // Create a new band
  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    try {
      await api('/bands', { method: 'POST', body: { bandId, nfcUid, holderName } });
      setBandId(''); setNfcUid(''); setHolderName('');
      setShowForm(false);
      refresh();
    } catch (err) {
      setFormError(err.message);
    }
  }

  // Block / unblock a band
  async function setStatus(id, status) {
    try {
      await api(`/bands/${id}`, { method: 'PATCH', body: { status } });
      refresh();
    } catch (err) {
      setListError(err.message);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="NFC Bands"
        subtitle="Register and manage every band."
        actions={<Button variant="gold" onClick={() => setShowForm(true)}><Plus size={15} /> Issue band</Button>}
      />

      <Input placeholder="Search band ID, UID or name…" value={search} onChange={(e) => setSearch(e.target.value)} />

      {listError && <p className="rounded-[10px] border border-red-500/20 bg-red-500/[0.08] px-3 py-2.5 text-[13px] text-red-300">{listError}</p>}

      {loading && <Loading text="Loading bands…" />}
      {!loading && bands.length === 0 && <EmptyState title="No NFC bands found" body="Issue your first band to get started." />}

      {!loading && bands.length > 0 && (
        <div className="premium-card overflow-x-auto rounded-2xl">
          <table className="premium-table">
            <thead><tr><th>Band</th><th>UID</th><th>Holder</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {bands.map((b) => (
                <tr key={b._id}>
                  <td className="font-mono font-semibold text-white">{b.bandId}</td>
                  <td className="font-mono text-white/60">{b.nfcUid}</td>
                  <td className="text-white/80">{b.holderName || '—'}</td>
                  <td><Badge value={b.status} /></td>
                  <td className="text-right">
                    {b.status === 'ACTIVE'
                      ? <Button variant="danger" onClick={() => setStatus(b._id, 'BLOCKED')}>Block</Button>
                      : <Button variant="secondary" onClick={() => setStatus(b._id, 'ACTIVE')}>Activate</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add-band popup */}
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form onSubmit={handleCreate} className="premium-card w-full max-w-[400px] space-y-4 rounded-3xl p-6">
            <h2 className="text-[16px] font-semibold text-white">Issue new band</h2>
            <div className="space-y-[7px]">
              <label className="block text-[12.5px] font-semibold text-white/85">Band ID (e.g. NF-4825)</label>
              <Input value={bandId} onChange={(e) => setBandId(e.target.value)} placeholder="NF-4825" />
            </div>
            <div className="space-y-[7px]">
              <label className="block text-[12.5px] font-semibold text-white/85">NFC UID (printed on the tag)</label>
              <Input value={nfcUid} onChange={(e) => setNfcUid(e.target.value)} placeholder="04:AA:BB:CC" />
            </div>
            <div className="space-y-[7px]">
              <label className="block text-[12.5px] font-semibold text-white/85">Holder name (student)</label>
              <Input value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Riya Patel" />
            </div>
            {formError && <p className="text-[13px] text-red-300">{formError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="gold" type="submit">Issue band</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
