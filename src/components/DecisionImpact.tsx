import { Activity, ArrowRight, ShieldAlert, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';
import { getDecisionImpact } from '../engine/simulator';
import type { FinanceMetrics } from '../types/finance';
import { money, signedMoney } from './shared';

export function DecisionImpact({ before, after }: { before: FinanceMetrics; after: FinanceMetrics }) {
  const impact = getDecisionImpact(before, after);
  const riskDelta = after.riskScore - before.riskScore;
  const runwayDelta = (after.runwayDays ?? 0) - (before.runwayDays ?? 0);
  const forecastDelta = after.forecast - before.forecast;
  const Icon = impact.tone === 'danger' ? ShieldAlert : impact.tone === 'warn' ? Activity : ShieldCheck;
  return <section className={`card decision-impact-card impact-${impact.tone}`} aria-label="Decision impact profile">
    <div className="decision-impact-head">
      <div><span className="eyebrow">IMPACT PROFILE</span><h2>How much does this choice move your future?</h2></div>
      <span className="impact-level"><Icon size={13} />{impact.label} IMPACT</span>
    </div>
    <p className="decision-impact-summary">{impact.summary}</p>
    <div className="impact-metrics">
      <div><span>FORECAST</span><strong className={forecastDelta < 0 ? 'delta-negative' : 'delta-positive'}>{signedMoney(forecastDelta)}</strong><small>month-end shift</small></div>
      <div><span>RUNWAY</span><strong className={runwayDelta < 0 ? 'delta-negative' : 'delta-positive'}>{runwayDelta > 0 ? '+' : ''}{runwayDelta.toFixed(1)}d</strong><small>days of room</small></div>
      <div><span>RISK</span><strong className={riskDelta > 0 ? 'delta-negative' : 'delta-positive'}>{riskDelta > 0 ? '+' : ''}{riskDelta} pts</strong><small>risk score shift</small></div>
    </div>
    <div className="impact-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(8, 50 + riskDelta * 2))}%` }} /></div>
    <div className="impact-foot"><span><TrendingDown size={13} />Lower is better for risk</span><span><TrendingUp size={13} />Compare before committing</span></div>
  </section>;
}

export function DominoEffect({ before, after }: { before: FinanceMetrics; after: FinanceMetrics }) {
  const nodes = [
    { label: 'Balance', before: money(before.balance), after: money(after.balance), delta: after.balance - before.balance, format: (value: number) => signedMoney(value) },
    { label: 'Safe to spend', before: money(before.safeToSpend), after: money(after.safeToSpend), delta: after.safeToSpend - before.safeToSpend, format: (value: number) => `${signedMoney(value)}/day` },
    { label: 'Month-end forecast', before: money(before.forecast), after: money(after.forecast), delta: after.forecast - before.forecast, format: (value: number) => signedMoney(value) },
    { label: 'Runway', before: before.runwayDays == null ? '—' : `${Math.floor(before.runwayDays)}d`, after: after.runwayDays == null ? '—' : `${Math.floor(after.runwayDays)}d`, delta: (after.runwayDays ?? 0) - (before.runwayDays ?? 0), format: (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)} days` },
    { label: 'Financial health', before: `${before.healthScore}/100`, after: `${after.healthScore}/100`, delta: after.healthScore - before.healthScore, format: (value: number) => `${value > 0 ? '+' : ''}${value} pts` },
    { label: 'Risk score', before: `${before.riskScore} · ${before.riskLabel}`, after: `${after.riskScore} · ${after.riskLabel}`, delta: after.riskScore - before.riskScore, format: (value: number) => `${value > 0 ? '+' : ''}${value} pts` },
  ];
  return <section className="card domino-card"><div className="section-heading"><div><span className="eyebrow">THE DOMINO EFFECT</span><h2>One purchase. Six consequences.</h2><p>Here’s how this decision moves through your month.</p></div><span className="domino-mark"><Activity size={17} /></span></div><div className="decision-journey" aria-label="Simulation flow"><span className="journey-active">BEFORE</span><ArrowRight size={13} /><span className="journey-decision">DECISION</span><ArrowRight size={13} /><span className="journey-active">AFTER</span></div><div className="domino-list">{nodes.map((item, index) => { const isRisk = item.label === 'Risk score'; const isNegative = isRisk ? item.delta > 0.01 : item.delta < -0.01; const isPositive = isRisk ? item.delta < -0.01 : item.delta > 0.01; return <div className="domino-row" key={item.label} style={{ animationDelay: `${index * 70}ms` }}><div className="domino-step"><span>{String(index + 1).padStart(2, '0')}</span>{index < nodes.length - 1 && <i />}</div><div className="domino-label">{item.label}</div><div className="domino-values"><span>{item.before}</span><ArrowRight size={14} /><strong>{item.after}</strong></div><div className={`domino-delta ${isNegative ? 'delta-negative' : isPositive ? 'delta-positive' : ''}`}>{item.delta === 0 ? 'No change' : item.format(item.delta)}</div></div>; })}</div></section>;
}
