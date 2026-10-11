import type { ReactNode } from 'react';
import {
  ArrowDownRight, ArrowUpRight, CalendarClock, Clapperboard, Compass, GraduationCap, HeartPulse, LayoutDashboard,
  Lightbulb, ReceiptText, ShoppingBag, Sparkles, Target, TrainFront, Utensils, Wallet,
} from 'lucide-react';
import type { FinanceMetrics, PageId } from '../types/finance';

export const money = (value: number) => {
  const abs = Math.round(Math.abs(value)).toLocaleString('en-IN');
  return value < 0 ? `−₹${abs}` : `₹${abs}`;
};
export const shortMoney = (value: number) => {
  const abs = Math.abs(value);
  const core = abs >= 100000 ? `${(abs / 100000).toFixed(1)}L` : abs >= 1000 ? `${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k` : `${Math.round(abs)}`;
  return value < 0 ? `−₹${core}` : `₹${core}`;
};
export const signedMoney = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}₹${Math.round(Math.abs(value)).toLocaleString('en-IN')}`;
export const riskTone = (risk: FinanceMetrics['riskLabel']) => risk === 'LOW' ? 'good' : risk === 'MODERATE' ? 'warn' : 'danger';
export const categoryIcon = (category: string) => {
  if (category === 'Food') return Utensils;
  if (category === 'Transport') return TrainFront;
  if (category === 'Shopping') return ShoppingBag;
  if (category === 'Entertainment') return Clapperboard;
  if (category === 'Health') return HeartPulse;
  if (category === 'Education') return GraduationCap;
  return ReceiptText;
};

export const navItems: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'simulator', label: 'Simulator', icon: Compass },
  { id: 'money', label: 'Money', icon: Wallet },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'commitments', label: 'Commitments', icon: CalendarClock },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
];

export function BrandMark() {
  return <div className="brand-lockup"><div className="brand-mark"><span>R</span><i /></div><div><div className="brand-name">RUNWAY</div><div className="brand-caption">SEE THE CONSEQUENCE BEFORE YOU SPEND.</div></div></div>;
}

export function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; className?: string; type?: 'button' | 'submit'; disabled?: boolean;
}) {
  return <button type={type} disabled={disabled} onClick={onClick} className={`btn btn-${variant} ${className}`}>{children}</button>;
}

export function RiskPill({ risk }: { risk: FinanceMetrics['riskLabel'] }) {
  return <span className={`pill pill-${riskTone(risk)}`}><span className="pill-dot" />{risk} RISK</span>;
}

export function PageHeader({ eyebrow, title, subtitle, right }: { eyebrow: string; title: string; subtitle?: string; right?: ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{right && <div className="page-header-right">{right}</div>}</div>;
}

export function MetricCard({ label, value, detail, icon: Icon, tone = 'purple', trend }: {
  label: string; value: string; detail: string; icon: typeof Wallet; tone?: 'purple' | 'green' | 'amber' | 'ink'; trend?: 'up' | 'down';
}) {
  return <div className="metric-card"><div className="metric-top"><div className={`metric-icon metric-icon-${tone}`}><Icon size={17} strokeWidth={2.1} /></div>{trend && <span className={`tiny-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>{trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}</span>}</div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-detail">{detail}</div></div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-orbit"><Sparkles size={20} /></div><h3>{title}</h3><p>{description}</p>{action}</div>;
}
