import { useMemo } from 'react';
import {
  Activity, ArrowRight, ArrowUpRight, ChevronDown, ChevronRight, Gauge, Plus, ShieldAlert, ShieldCheck,
  Sparkles, Target, TrendingUp,
} from 'lucide-react';
import { calculateForecastTimeline } from '../engine/calculations';
import { compareScenarios } from '../engine/simulator';
import { useFinanceStore } from '../store/useFinanceStore';
import type { FinanceMetrics, PageId } from '../types/finance';
import { Button, EmptyState, MetricCard, PageHeader, RiskPill, categoryIcon, money, riskTone, shortMoney } from '../components/shared';

type StoreState = ReturnType<typeof useFinanceStore.getState>;

function buildChartPath(points: { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
}

export function ForecastChart({ state }: { state: StoreState }) {
  const rows = useMemo(() => calculateForecastTimeline(state), [state.challenge, state.transactions, state.commitments]);
  const width = 760;
  const height = 238;
  const pad = { top: 18, right: 12, bottom: 34, left: 56 };
  const values = rows.flatMap((row) => [row.actual, row.projected]).filter((value): value is number => value != null);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = Math.max(1, max - min);
  const x = (day: number) => pad.left + ((day - 1) / Math.max(1, rows.length - 1)) * (width - pad.left - pad.right);
  const y = (value: number) => pad.top + (1 - (value - min) / range) * (height - pad.top - pad.bottom);
  const actualPoints = rows.filter((row) => row.actual != null).map((row) => ({ x: x(row.day), y: y(row.actual as number) }));
  const projectedPoints = rows.filter((row) => row.projected != null).map((row) => ({ x: x(row.day), y: y(row.projected as number) }));
  const zeroY = y(0);
  const todayX = x(state.challenge.currentDay);
  const ticks = [1, 5, 10, 15, 20, 25, 30].filter((day) => day <= rows.length);
  const yTicks = [max, max / 2, 0, min].filter((value, index, list) => index === 0 || Math.abs(value - list[index - 1]) > range * .04);
  return <div className="forecast-chart" role="img" aria-label="Actual and projected balance from day 1 to day 30">
    <div className="chart-legend"><span><i className="legend-line actual-line" />Actual balance</span><span><i className="legend-line projected-line" />Projected balance</span><span className="legend-today"><i />Today</span></div>
    <svg className="forecast-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      {yTicks.map((value, index) => <g key={`y-${index}`}><line x1={pad.left} x2={width - pad.right} y1={y(value)} y2={y(value)} stroke="#efeff4" strokeDasharray="3 4" /><text x={pad.left - 8} y={y(value) + 4} textAnchor="end" fill="#9898a5" fontSize="11">{shortMoney(value)}</text></g>)}
      <line x1={pad.left} x2={width - pad.right} y1={zeroY} y2={zeroY} stroke="#f06c6c" strokeDasharray="4 4" />
      <line x1={todayX} x2={todayX} y1={pad.top} y2={height - pad.bottom} stroke="#b9b3ff" strokeDasharray="4 5" />
      <text x={Math.min(width - 38, todayX + 5)} y={pad.top + 10} fill="#635BFF" fontSize="10" fontWeight="700">TODAY</text>
      {ticks.map((day) => <text key={day} x={x(day)} y={height - 8} textAnchor="middle" fill="#9898a5" fontSize="11">D{day}</text>)}
      <path d={buildChartPath(actualPoints)} fill="none" stroke="#635BFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={buildChartPath(projectedPoints)} fill="none" stroke="#16A085" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={todayX} cy={y(rows[state.challenge.currentDay - 1]?.actual ?? rows[state.challenge.currentDay - 1]?.projected ?? 0)} r="5" fill="#635BFF" stroke="#fff" strokeWidth="2" />
    </svg>
  </div>;
}

export function RunwayLine({ state, metrics }: { state: StoreState; metrics: FinanceMetrics }) {
  const day = state.challenge.currentDay;
  const danger = metrics.forecast < 0;
  return <div className="runway-line-card card">
    <div className="section-heading"><div><span className="eyebrow">THE 30-DAY VIEW</span><h2>Your runway, at a glance</h2><p>Actual days behind you. Possible futures ahead.</p></div><span className={`mini-status ${danger ? 'mini-danger' : 'mini-good'}`}><span />{danger ? 'Shortfall risk' : 'Forecast stable'}</span></div>
    <div className="runway-timeline">
      <div className="timeline-labels"><span>DAY 01</span><span className="today-label">TODAY · {String(day).padStart(2, '0')}</span><span>DAY 30</span></div>
      <div className="timeline-rail"><div className="timeline-actual" style={{ width: `${((day - 1) / 29) * 100}%` }} /><div className={`timeline-future ${danger ? 'timeline-future-danger' : ''}`} style={{ left: `${((day - 1) / 29) * 100}%`, width: `${((30 - day) / 29) * 100}%` }} /><div className="timeline-today-marker" style={{ left: `${((day - 1) / 29) * 100}%` }}><span /></div>
        {state.commitments.filter((item) => item.dueDay > day).map((item) => <div key={item.id} className="commitment-marker" style={{ left: `${((item.dueDay - 1) / 29) * 100}%` }} title={`${item.name}: ${money(item.amount)}`}><span>{item.name}</span></div>)}
      </div>
      <div className="timeline-foot"><span><i className="dot dot-purple" />Days complete</span><span><i className="dot dot-green" />Projected runway</span><span><i className="dot dot-orange" />Upcoming commitment</span></div>
    </div>
    <div className="runway-callout"><div className="callout-icon"><Activity size={17} /></div><div><strong>{metrics.forecast >= 0 ? 'Your future is still in your hands.' : 'Your current pace needs a reset.'}</strong><p>{metrics.forecast >= 0 ? `At this pace, you may end the month with ${money(metrics.forecast)} left after planned commitments.` : `Your projection is ${money(Math.abs(metrics.forecast))} below zero. Try a recovery scenario before it gets there.`}</p></div><ArrowRight size={18} className="callout-arrow" /></div>
  </div>;
}

export function Dashboard({ state, metrics, navigate }: { state: StoreState; metrics: FinanceMetrics; navigate: (page: PageId) => void }) {
  const spentPercent = Math.min(100, (metrics.totalSpent / state.challenge.startingBudget) * 100);
  const examplePurchase = useMemo(() => compareScenarios(state, { amount: 1500, category: 'Shopping', description: 'Example purchase' })[0].metrics, [state.challenge, state.transactions, state.commitments, state.goals]);
  const recent = state.transactions.filter((item) => item.day <= state.challenge.currentDay).slice(-4).reverse();
  return <div className="page-stack">
    <PageHeader eyebrow={`YOUR 30-DAY CHALLENGE · DAY ${state.challenge.currentDay} OF ${state.challenge.totalDays}`} title="Your money, in motion." subtitle="A clearer view of what today means for the rest of your month." right={<div className="day-chip"><span className="day-chip-dot" />CHALLENGE ACTIVE <ChevronDown size={13} /></div>} />

    <div className="dashboard-hero-grid">
      <section className="balance-hero">
        <div className="balance-hero-top"><span className="hero-kicker"><span className="hero-kicker-dot" />CURRENT BALANCE</span><span className="hero-challenge-label">30 DAY RUNWAY <span>↗</span></span></div>
        <div className="hero-balance">{money(metrics.balance)}</div>
        <div className="hero-balance-foot"><span>of {money(state.challenge.startingBudget)} starting budget</span><span className="hero-remaining">{Math.round(100 - spentPercent)}% unspent</span></div>
        <div className="hero-budget-rail"><div style={{ width: `${Math.min(100, (metrics.balance / state.challenge.startingBudget) * 100)}%` }} /></div>
        <div className="hero-bottom-row"><div className="hero-stat"><span>SPENT SO FAR</span><strong>{money(metrics.totalSpent)}</strong></div><div className="hero-stat-divider" /><div className="hero-stat"><span>COMMITTED NEXT</span><strong>{money(metrics.upcomingCommitments)}</strong></div><div className="hero-spark"><svg viewBox="0 0 116 38" aria-label="Illustrative balance sparkline"><path d="M1 32 C 12 26, 17 30, 27 22 S 42 28, 51 16 S 63 19, 72 12 S 87 17, 95 7 S 108 8, 115 3" fill="none" stroke="rgba(255,255,255,.86)" strokeWidth="2.5" strokeLinecap="round" /></svg></div></div>
      </section>
      <section className="safe-spend-hero card"><div className="safe-spend-top"><div className="metric-icon metric-icon-green"><ShieldCheck size={18} /></div><span className="micro-label">THE NUMBER THAT MATTERS</span></div><div className="safe-spend-title">Safe to spend today</div><div className={`safe-spend-value ${metrics.safeToSpend < 0 ? 'negative-value' : ''}`}>{money(metrics.safeToSpend)}</div><p>{metrics.safeToSpend >= 0 ? 'After protecting upcoming bills and your goal.' : 'Your plan needs more room before another purchase.'}</p><div className="safe-spend-divider" /><div className="safe-spend-bottom"><span><span className="safe-dot" />{metrics.daysRemaining} days left in your plan</span><button onClick={() => navigate('simulator')} aria-label="Open spending simulator"><ArrowUpRight size={17} /></button></div></section>
    </div>

    <div className="metrics-grid">
      <MetricCard label="Month-end forecast" value={money(metrics.forecast)} detail={metrics.forecast >= 0 ? 'Projected after commitments' : 'Projected shortfall'} icon={TrendingUp} tone={metrics.forecast >= 0 ? 'green' : 'amber'} trend={metrics.forecast >= 0 ? 'up' : 'down'} />
      <MetricCard label="Your runway" value={metrics.runwayDays == null ? 'No spend data' : `${Math.floor(metrics.runwayDays)} days`} detail="At your current spending pace" icon={Gauge} tone="purple" />
      <MetricCard label="Financial health" value={`${metrics.healthScore}/100`} detail={metrics.healthLabel} icon={Activity} tone="ink" />
      <div className="risk-metric-card"><div className="metric-top"><div className={`metric-icon ${riskTone(metrics.riskLabel) === 'good' ? 'metric-icon-green' : riskTone(metrics.riskLabel) === 'warn' ? 'metric-icon-amber' : 'metric-icon-pink'}`}><ShieldAlert size={17} /></div><RiskPill risk={metrics.riskLabel} /></div><div className="metric-label">Financial risk</div><div className="metric-value">{metrics.riskScore}<span className="metric-out-of">/100</span></div><div className="risk-track"><div className={`risk-track-fill ${riskTone(metrics.riskLabel)}`} style={{ width: `${metrics.riskScore}%` }} /></div></div>
    </div>

    <RunwayLine state={state} metrics={metrics} />

    <div className="content-grid dashboard-lower-grid">
      <section className="card chart-card"><div className="section-heading"><div><span className="eyebrow">THE LOOK AHEAD</span><h2>Your projected balance</h2><p>One line for where you are. One for where you're headed.</p></div><span className="chart-period">30 DAYS <ChevronDown size={13} /></span></div><ForecastChart state={state} /><div className={`chart-insight ${metrics.forecast < 0 ? 'chart-insight-danger' : ''}`}><span className="chart-insight-icon">{metrics.forecast < 0 ? <ShieldAlert size={16} /> : <Sparkles size={16} />}</span><span>{metrics.forecast < 0 ? `A ${money(Math.abs(metrics.forecast))} gap is forming in your projected month.` : `Your projected month-end buffer is ${money(metrics.forecast)}. Small choices can change it.`}</span><button onClick={() => navigate('simulator')} aria-label="Test a purchase">Test a purchase <ArrowRight size={14} /></button></div></section>
      <div className="dashboard-side-stack">
        <section className="card goal-mini-card"><div className="section-heading compact-heading"><div><span className="eyebrow">SAVING FOR SOMETHING</span><h2>Your goal</h2></div><button className="icon-button" onClick={() => navigate('goals')} aria-label="View goals"><ArrowUpRight size={17} /></button></div>
          {state.goals.length ? state.goals.slice(0, 1).map((goal) => <div className="goal-mini-content" key={goal.id}><div className="goal-mini-top"><div className="goal-emblem"><Target size={21} /></div><span className="goal-percent">{Math.round(Math.min(100, goal.currentAmount / goal.targetAmount * 100))}%</span></div><h3>{goal.name}</h3><div className="goal-money-line"><strong>{money(goal.currentAmount)}</strong><span>of {money(goal.targetAmount)}</span></div><div className="goal-progress-track"><div style={{ width: `${Math.min(100, goal.currentAmount / goal.targetAmount * 100)}%` }} /></div><div className="goal-mini-foot"><span>Target · Day {goal.targetDay}</span><span>{money(Math.max(0, goal.targetAmount - goal.currentAmount))} to go</span></div></div>) : <EmptyState title="Give your money a destination." description="Create a goal to make your next decision more intentional." action={<Button variant="secondary" onClick={() => navigate('goals')}>Create a goal <Plus size={15} /></Button>} />}
        </section>
        <section className="card recent-card"><div className="section-heading compact-heading"><div><span className="eyebrow">JUST HAPPENED</span><h2>Recent activity</h2></div><button className="text-button" onClick={() => navigate('money')}>View all <ChevronRight size={14} /></button></div>
          {recent.length ? <div className="recent-list">{recent.map((tx) => { const Icon = categoryIcon(tx.category); return <div className="recent-row" key={tx.id}><div className={`transaction-icon tx-${tx.category.toLowerCase()}`}><Icon size={16} /></div><div className="recent-row-info"><strong>{tx.description}</strong><span>{tx.category} · Day {tx.day}</span></div><strong className={`recent-amount ${tx.type === 'income' ? 'income-amount' : ''}`}>{tx.type === 'income' ? '+' : '−'}{money(tx.amount).replace('−', '')}</strong></div>; })}</div> : <EmptyState title="Your story starts here." description="Add a transaction to see activity." />}
        </section>
      </div>
    </div>

    <section className="simulator-banner"><div className="sim-banner-orbit orbit-one" /><div className="sim-banner-orbit orbit-two" /><div className="sim-banner-copy"><span className="hero-kicker"><Sparkles size={14} /> BEFORE YOU BUY</span><h2>What if you <em>didn't</em> buy it?</h2><p>Run the decision. See the trade-offs. Choose your future with your eyes open.</p><Button onClick={() => navigate('simulator')}>Simulate a decision <ArrowRight size={16} /></Button></div><div className="sim-banner-visual"><div className="scenario-float float-current"><span>YOUR FUTURE</span><strong>{money(metrics.forecast)}</strong><small>if you stay on track</small></div><div className="scenario-float float-alt"><span>IF YOU SPEND</span><strong className={examplePurchase.forecast < 0 ? 'text-danger' : ''}>{money(examplePurchase.forecast)}</strong><small>example · ₹1,500 purchase</small></div><div className="banner-connecting-line" /></div></section>
  </div>;
}
