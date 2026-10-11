import { lazy, Suspense, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarClock, Check, ChevronRight, CircleDollarSign, CircleHelp, Compass, LayoutDashboard, Lightbulb, Menu, RotateCcw, Target, Wallet, X } from 'lucide-react';
import { calculateFinancialMetrics } from './engine/calculations';
import { useFinanceStore } from './store/useFinanceStore';
import type { PageId, ScenarioResult } from './types/finance';
import { BrandMark, Button, money, navItems } from './components/shared';
const Dashboard = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.Dashboard })));
const Simulator = lazy(() => import('./pages/SimulatorPage').then((module) => ({ default: module.Simulator })));
const MoneyPage = lazy(() => import('./pages/MoneyPage').then((module) => ({ default: module.MoneyPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage').then((module) => ({ default: module.GoalsPage })));
const CommitmentsPage = lazy(() => import('./pages/CommitmentsPage').then((module) => ({ default: module.CommitmentsPage })));
const InsightsPage = lazy(() => import('./pages/InsightsPage').then((module) => ({ default: module.InsightsPage })));

function App() {
  const store = useFinanceStore();
  const [page, setPage] = useState<PageId>('dashboard');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [toast, setToast] = useState('');
  const metrics = useMemo(() => calculateFinancialMetrics(store), [store.challenge, store.transactions, store.commitments, store.goals]);

  function navigate(next: PageId) { setPage(next); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function commitScenario(scenario: ScenarioResult) {
    if (scenario.id !== 'skip') store.loadScenario(scenario.state);
    setPage('dashboard'); setToast(scenario.id === 'skip' ? 'Plan kept as-is. No changes made.' : 'Decision committed. Your runway has been recalculated.');
    window.setTimeout(() => setToast(''), 3200);
  }
  function resetDemo() { store.resetDemo(); setPage('dashboard'); setShowReset(false); setToast('Demo data restored. Ready for a fresh run.'); window.setTimeout(() => setToast(''), 3200); }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="sidebar-top"><BrandMark /><button className="mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="nav-label">YOUR WORKSPACE</div><nav className="side-nav" aria-label="Main navigation">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${page === item.id ? 'nav-item-active' : ''}`} onClick={() => navigate(item.id)} aria-current={page === item.id ? 'page' : undefined}><Icon size={18} strokeWidth={page === item.id ? 2.3 : 1.8} /><span>{item.label}</span>{page === item.id && <span className="nav-active-rail" />}{item.id === 'simulator' && <span className="nav-new-mark">CORE</span>}</button>; })}</nav>
      <div className="sidebar-bottom"><div className="challenge-side-card"><div className="challenge-side-top"><span>30-DAY CHALLENGE</span><span className="challenge-live-dot" /></div><div className="challenge-side-title">Your runway.<br /><em>Your rules.</em></div><div className="challenge-progress-track"><div style={{ width: `${store.challenge.currentDay / store.challenge.totalDays * 100}%` }} /></div><div className="challenge-progress-label"><span>DAY {String(store.challenge.currentDay).padStart(2, '0')}</span><span>{store.challenge.totalDays} DAYS</span></div><div className="challenge-side-foot"><span><CircleDollarSign size={14} />{money(store.challenge.startingBudget)} start</span><span>{Math.round(store.challenge.currentDay / store.challenge.totalDays * 100)}% through</span></div></div><button className="sidebar-reset" onClick={() => setShowReset(true)}><RotateCcw size={15} />Reset demo data</button><div className="sidebar-footer"><div className="user-avatar">U</div><div className="user-info"><strong>Your challenge</strong><span>Personal workspace</span></div><span className="user-status" /></div></div>
    </aside>
    {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation overlay" />}
    <div className="main-column">
      <header className="topbar"><button className="mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumbs"><span>RUNWAY</span><ChevronRight size={14} /><strong>{navItems.find((item) => item.id === page)?.label}</strong></div><div className="topbar-right"><span className="local-save"><span />SAVED LOCALLY</span><button className="topbar-help" onClick={() => setToast('Your data stays in this browser. Reset Demo restores the seeded challenge.')} aria-label="About local data"><CircleHelp size={17} /></button><div className="topbar-avatar">U</div></div></header>
      <main className="main-content"><Suspense fallback={<div className="page-loading" role="status" aria-live="polite"><span className="loading-spinner" />Loading workspace…</div>}><AnimatePresence mode="wait"><motion.div key={page} className="page-transition" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>{page === 'dashboard' ? <Dashboard state={store} metrics={metrics} navigate={navigate} /> : page === 'simulator' ? <Simulator state={store} metrics={metrics} onCommit={commitScenario} /> : page === 'money' ? <MoneyPage state={store} metrics={metrics} /> : page === 'goals' ? <GoalsPage state={store} metrics={metrics} /> : page === 'commitments' ? <CommitmentsPage state={store} metrics={metrics} /> : <InsightsPage state={store} metrics={metrics} navigate={navigate} />}</motion.div></AnimatePresence></Suspense></main>
      <footer className="app-footer"><span>RUNWAY © 2026</span><span>See the consequence before you spend.</span><button onClick={() => setShowReset(true)}>Reset demo <RotateCcw size={12} /></button></footer>
    </div>
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{[{ id: 'dashboard' as PageId, label: 'Home', icon: LayoutDashboard }, { id: 'money' as PageId, label: 'Money', icon: Wallet }, { id: 'goals' as PageId, label: 'Goals', icon: Target }, { id: 'commitments' as PageId, label: 'Bills', icon: CalendarClock }, { id: 'insights' as PageId, label: 'Insights', icon: Lightbulb }].slice(0, 2).map((item) => { const Icon = item.icon; return <button key={item.id} className={page === item.id ? 'mobile-nav-active' : ''} onClick={() => navigate(item.id)} aria-current={page === item.id ? 'page' : undefined}><Icon size={19} /><span>{item.label}</span></button>; })}<button className={`mobile-nav-sim ${page === 'simulator' ? 'active' : ''}`} onClick={() => navigate('simulator')}><span><Compass size={20} /></span><small>Simulate</small></button>{[{ id: 'goals' as PageId, label: 'Goals', icon: Target }, { id: 'commitments' as PageId, label: 'Bills', icon: CalendarClock }, { id: 'insights' as PageId, label: 'Insights', icon: Lightbulb }].map((item) => { const Icon = item.icon; return <button key={item.id} className={page === item.id ? 'mobile-nav-active' : ''} onClick={() => navigate(item.id)} aria-current={page === item.id ? 'page' : undefined}><Icon size={19} /><span>{item.label}</span></button>; })}</nav>
    {showReset && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowReset(false); }}><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title"><div className="confirm-icon"><RotateCcw size={19} /></div><button className="modal-close" onClick={() => setShowReset(false)} aria-label="Close dialog"><X size={17} /></button><span className="eyebrow">RESET CHALLENGE</span><h2 id="reset-title">Start with a clean runway?</h2><p>This restores the original ₹10,000 demo, Day 12 transactions, goals and commitments. Your latest changes will be replaced.</p><div className="confirm-actions"><Button variant="secondary" onClick={() => setShowReset(false)}>Keep my data</Button><Button variant="danger" onClick={resetDemo}>Reset demo <RotateCcw size={14} /></Button></div></section></div>}
    <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="toast-message"><span><Check size={15} /></span>{toast}</motion.div>}</AnimatePresence>
  </div>;
}

export default App;
