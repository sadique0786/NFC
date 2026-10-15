// Shared UI pieces — SAME premium look, simple code.
// Students: just import { Card, Button, Input, Badge, PageHeader } etc.
import { Inbox } from 'lucide-react';

// Button: <Button variant="gold">Save</Button> or <Button variant="secondary">
export function Button({ children, onClick, type = 'button', variant = 'secondary', disabled, className = '' }) {
  const styles = {
    gold: 'gold-button font-semibold',
    primary: 'bg-white text-black hover:bg-white/90',
    secondary: 'border border-white/[0.09] bg-white/[0.04] text-white hover:bg-white/[0.07]',
    danger: 'border border-red-500/25 bg-red-500/[0.12] text-red-300 hover:bg-red-500/[0.2]',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] px-4 text-[13.5px] font-medium transition disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// Input + Select use the same .premium-input style from index.css
export function Input(props) {
  return <input {...props} className={`premium-input h-10 w-full rounded-[10px] px-3.5 text-[13.5px] text-white outline-none ${props.className || ''}`} />;
}

export function Select(props) {
  return <select {...props} className={`premium-input h-10 rounded-[10px] px-3 pr-8 text-[13.5px] text-white outline-none ${props.className || ''}`} />;
}

// Card: dark glass box
export function Card({ children, className = '' }) {
  return <div className={`premium-card rounded-2xl p-5 ${className}`}>{children}</div>;
}

// Badge: colored pill for ACTIVE / SUCCESS / DENIED etc.
const BADGE_COLORS = {
  ACTIVE: 'border-emerald-400/20 bg-emerald-400/[0.1] text-emerald-300',
  SUCCESS: 'border-emerald-400/20 bg-emerald-400/[0.1] text-emerald-300',
  AVAILABLE: 'border-white/10 bg-white/[0.05] text-white/60',
  BLOCKED: 'border-red-400/20 bg-red-400/[0.1] text-red-300',
  DENIED: 'border-red-400/20 bg-red-400/[0.1] text-red-300',
  UNKNOWN: 'border-white/10 bg-white/[0.05] text-white/55',
};

export function Badge({ value }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[0.06em] ${BADGE_COLORS[value] || BADGE_COLORS.AVAILABLE}`}>
      {value}
    </span>
  );
}

// Page title row
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-white">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[13.5px] text-white/45">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// Shown when a list is empty
export function EmptyState({ title, body }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.015] px-6 py-14 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white/50">
        <Inbox size={20} />
      </span>
      <p className="mt-1 text-[14px] font-semibold text-white">{title}</p>
      <p className="max-w-sm text-[13px] text-white/40">{body}</p>
    </div>
  );
}

// Simple loading placeholder
export function Loading({ text = 'Loading…' }) {
  return <p className="py-10 text-center text-sm text-white/40">{text}</p>;
}
