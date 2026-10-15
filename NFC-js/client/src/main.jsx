// Entry point — everything that wires the app lives here:
// AuthProvider (login state) + AppLayout (sidebar) + router (4 pages).
// Pages themselves stay in src/pages/ so each one is easy to teach.
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, NavLink, Navigate, Outlet, RouterProvider, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Nfc, ScanLine, LogOut, Menu } from 'lucide-react';
import './index.css';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BandsPage } from './pages/BandsPage';
import { ScannerPage } from './pages/ScannerPage';

// ---------- Sidebar links (only 3 pages) ----------
const LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bands', label: 'NFC Bands', icon: Nfc },
  { to: '/scanner', label: 'NFC Scanner', icon: ScanLine },
];

// ---------- Sidebar layout (same premium look) ----------
function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false); // mobile menu

  function handleLogout() {
    logout();
    nav('/login');
  }

  const initials = user && user.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="premium-app-bg min-h-screen text-white">
      {open && <button className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu" />}

      <aside className={`fixed inset-y-0 left-0 z-40 w-[272px] flex-col border-r border-white/[0.07] bg-[#0A0A0C]/95 backdrop-blur-xl ${open ? 'flex' : 'hidden'} lg:flex`}>
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4">
          <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-gradient-to-b from-[#F0D48A] via-[#D4A853] to-[#8F6A2E]">
            <Nfc size={18} className="text-[#1A1408]" />
          </span>
          <span className="leading-none">
            <span className="block text-[15px] font-bold text-white">AirData</span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4A853]/90">NFC Intelligence</span>
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-[2px]">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[13.5px] font-medium transition ${
                      isActive ? 'bg-white/[0.07] text-white' : 'text-white/55 hover:bg-white/[0.045] hover:text-white'
                    }`
                  }
                >
                  <l.icon size={17} />
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-xl px-2 py-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#E5BE6B] to-[#8F6A2E] text-[12px] font-bold text-black">
              {initials}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[13px] font-semibold text-white">{user?.name || 'Admin'}</span>
              <span className="block truncate text-[11px] text-white/40">{user?.email || ''}</span>
            </span>
          </div>
          <button onClick={handleLogout} className="flex h-9 w-full items-center justify-center gap-2 rounded-[10px] text-white/50 transition hover:bg-red-500/10 hover:text-red-300">
            <LogOut size={16} /> <span className="text-[12.5px] font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[272px]">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#060607]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-[10px] text-white/60 hover:bg-white/[0.06] lg:hidden" aria-label="Open menu">
              <Menu size={18} />
            </button>
            <span className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11.5px] font-medium text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>

        <footer className="mx-auto w-full max-w-[1360px] px-4 pb-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4 text-[11.5px] text-white/30">
            <p><span className="font-semibold text-white/50">AirData</span> · Premium NFC Infrastructure</p>
            <p>All systems operational</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ---------- Login guard: not logged in -> /login ----------
function RequireLogin() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ---------- Routes: only 4 pages ----------
const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireLogin />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/bands', element: <BandsPage /> },
          { path: '/scanner', element: <ScannerPage /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
