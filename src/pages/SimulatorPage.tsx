import { useState, type FormEvent } from 'react';
import {
  ArrowRight, Check, CircleHelp, Compass, ShieldAlert, ShieldCheck, ShoppingBag, Sparkles, Zap,
} from 'lucide-react';
import { compareScenarios } from '../engine/simulator';
import { useFinanceStore } from '../store/useFinanceStore';
import { CATEGORIES, type Category, type FinanceMetrics, type ScenarioResult } from '../types/finance';
import { Button, PageHeader, categoryIcon, money, riskTone, signedMoney } from '../components/shared';
import { DecisionImpact, DominoEffect } from '../components/DecisionImpact';

type StoreState = ReturnType<typeof useFinanceStore.getState>;

export function Simulator({ state, metrics, onCommit }: { state: StoreState; metrics: FinanceMetrics; onCommit: (scenario: ScenarioResult) => void }) {
  const [amount, setAmount] = useState('1500');
  const [category, setCategory] = useState<Category>('Shopping');
  const [description, setDescription] = useState('New shoes');
  const [scenarios, setScenarios] = useState<ScenarioResult[] | null>(null);
  const [selectedId, setSelectedId] = useState('buy');
  const [showResult, setShowResult] = useState(false);
  const [notice, setNotice] = useState('');
  const parsedAmount = Number(amount);
  const selected = scenarios?.find((item) => item.id === selectedId);
  const currentBefore = metrics;

  function runSimulation(event: FormEvent) {
    event.preventDefault();
    setNotice('');
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) { setNotice('Enter an amount greater than ₹0 to run the simulation.'); return; }
    if (parsedAmount > Math.max(0, metrics.balance) * 2) { setNotice('That amount is unusually large compared with your current balance. Try it anyway with a smaller test amount.'); }
    const results = compareScenarios(state, { amount: parsedAmount, category, description });
    setScenarios(results);
    setSelectedId('buy');
    setShowResult(true);
  }

  function chooseScenario(id: string) { setSelectedId(id); }
  function commitSelected() {
    if (!selected) return;
    onCommit(selected);
    setScenarios(null);
    setShowResult(false);
    setNotice(selected.id === 'skip' ? 'Decision saved: you kept your current plan.' : 'Decision added to your runway. Your dashboard has been updated.');
  }

  return <div className="page-stack">
    <PageHeader eyebrow="DECISION LAB · LIVE SIMULATION" title="Test a decision." subtitle="The future is easier to choose when you can see it first." right={<div className="engine-live"><span /><span className="engine-pulse" />ENGINE LIVE</div>} />
    <div className="simulator-intro-strip"><div className="sim-intro-icon"><Compass size={19} /></div><div><strong>Your money has a future. Take a look before you spend.</strong><p>Every result is calculated against your current challenge, commitments and savings goals.</p></div><div className="sim-intro-days"><span>DAY</span><strong>{String(state.challenge.currentDay).padStart(2, '0')}<small>/{state.challenge.totalDays}</small></strong></div></div>
    <div className="simulator-layout">
      <form className="card decision-form" onSubmit={runSimulation}>
        <div className="form-heading"><div className="form-step">01</div><div><span className="eyebrow">THE DECISION</span><h2>What are you considering?</h2><p>Be specific. The math will do the rest.</p></div></div>
        <label className="field-label" htmlFor="purchase-amount">How much will it cost?</label>
        <div className="amount-input-wrap"><span>₹</span><input id="purchase-amount" type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1500" required /><span className="amount-suffix">INR</span></div>
        <div className="quick-amounts"><span>QUICK ADD</span>{[500, 1000, 1500, 2500].map((value) => <button type="button" key={value} className={Number(amount) === value ? 'quick-amount active' : 'quick-amount'} onClick={() => setAmount(String(value))}>{money(value)}</button>)}</div>
        <label className="field-label" htmlFor="purchase-category">What kind of spend is this?</label>
        <div className="category-grid" id="purchase-category">{CATEGORIES.map((item) => { const Icon = categoryIcon(item); return <button type="button" key={item} onClick={() => setCategory(item)} className={`category-choice ${category === item ? 'selected' : ''}`} aria-pressed={category === item}><Icon size={16} /><span>{item}</span>{category === item && <Check className="category-check" size={13} />}</button>; })}</div>
        <label className="field-label" htmlFor="purchase-description">Give it a name <span>OPTIONAL</span></label><input id="purchase-description" className="text-input" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. New shoes, concert tickets" />
        {notice && <div className="form-notice"><CircleHelp size={15} />{notice}</div>}
        <Button type="submit" className="simulate-submit">See My Future <ArrowRight size={17} /></Button>
        <div className="form-privacy"><ShieldCheck size={14} />Testing is just a simulation. Nothing changes until you commit.</div>
      </form>
      <div className="simulation-right">
        {!showResult || !selected ? <div className="card simulation-empty"><div className="empty-graphic"><div className="empty-graphic-orbit orbit-a" /><div className="empty-graphic-orbit orbit-b" /><div className="empty-graphic-core"><Compass size={32} /></div><span className="orbit-label label-now">NOW</span><span className="orbit-label label-future">FUTURE</span></div><span className="eyebrow">YOUR DECISION, DECODED</span><h2>One choice can<br />change the whole month.</h2><p>Run a scenario to see how your balance, safe-to-spend, goal and runway shift together.</p><div className="empty-checklist"><span><Check size={14} />Side-by-side outcomes</span><span><Check size={14} />No risk to your actual data</span><span><Check size={14} />Choose before you commit</span></div><div className="empty-state-foot"><span className="pulse-dot" />WAITING FOR YOUR DECISION</div></div> : <div key={selectedId} className="card simulation-result-card simulation-result-reveal">
          <div className="result-topline"><div><span className="eyebrow">SIMULATION COMPLETE</span><h2>{selected.id === 'skip' ? 'The money stays yours.' : selected.id === 'wait' ? 'A little patience changes the timing.' : selected.id === 'less' ? 'A smaller choice. More room.' : 'Here’s what happens next.'}</h2></div><span className={`result-risk ${riskTone(selected.metrics.riskLabel)}`}><span />{selected.metrics.riskLabel} RISK</span></div>
          <div className="result-purchase"><div className="purchase-icon"><ShoppingBag size={19} /></div><div><strong>{selected.id === 'skip' ? 'No purchase' : selected.id === 'wait' ? `${description || 'Planned purchase'} · in 2 days` : selected.id === 'less' ? `${description || 'Planned purchase'} · smaller option` : description || 'Planned purchase'}</strong><span>{selected.id === 'skip' ? 'Your current plan stays unchanged' : `${money(selected.amount)} · ${category}`}</span></div><div className="purchase-amount">{selected.id === 'skip' ? '₹0' : money(selected.amount)}</div></div>
          <div className="result-metrics-grid"><div className="result-metric"><span>MONTH-END</span><strong className={selected.metrics.forecast < 0 ? 'text-danger' : ''}>{money(selected.metrics.forecast)}</strong><small>{signedMoney(selected.metrics.forecast - currentBefore.forecast)} vs. now</small></div><div className="result-metric"><span>SAFE SPEND / DAY</span><strong>{money(selected.metrics.safeToSpend)}</strong><small>{signedMoney(selected.metrics.safeToSpend - currentBefore.safeToSpend)} per day</small></div><div className="result-metric"><span>HEALTH SCORE</span><strong>{selected.metrics.healthScore}<small className="score-out-of">/100</small></strong><small>{selected.metrics.healthScore - currentBefore.healthScore > 0 ? '+' : ''}{selected.metrics.healthScore - currentBefore.healthScore} points</small></div></div>
          <div className="result-takeaway"><div className={`takeaway-icon ${selected.metrics.forecast < currentBefore.forecast ? 'takeaway-warn' : 'takeaway-good'}`}>{selected.metrics.forecast < 0 ? <ShieldAlert size={17} /> : <Zap size={17} />}</div><div><strong>{selected.metrics.forecast < 0 ? 'This choice puts your buffer under pressure.' : selected.metrics.forecast < currentBefore.forecast ? 'This choice uses some of your future flexibility.' : 'This scenario protects more of your future balance.'}</strong><p>{selected.metrics.forecast < 0 ? `The current model projects a ${money(Math.abs(selected.metrics.forecast))} shortfall by Day ${state.challenge.totalDays}.` : `Your month-end projection moves by ${signedMoney(selected.metrics.forecast - currentBefore.forecast)} compared with your current plan.`}</p></div></div>
          <Button onClick={commitSelected} className="commit-button">{selected.id === 'skip' ? 'Keep my current plan' : 'Commit this decision'} <ArrowRight size={16} /></Button>
          <button className="reset-simulation" type="button" onClick={() => { setShowResult(false); setScenarios(null); setNotice(''); }}>Try a different decision</button>
        </div>}
      </div>
    </div>
    {showResult && scenarios && selected && <div className="page-stack result-extra-stack">
      <section className="card scenario-card"><div className="section-heading"><div><span className="eyebrow">FOUR POSSIBLE FUTURES</span><h2>There’s more than one way forward.</h2><p>Same engine. Different decision. Choose a path to inspect its impact.</p></div><span className="scenario-count">04 SCENARIOS</span></div>
        <div className="scenario-grid">{scenarios.map((scenario) => { const safest = scenario.metrics.riskScore === Math.min(...scenarios.map((item) => item.metrics.riskScore)); return <button type="button" key={scenario.id} className={`scenario-option ${selectedId === scenario.id ? 'scenario-selected' : ''} ${safest ? 'scenario-safest' : ''} ${scenario.id === 'skip' ? 'scenario-skip' : ''}`} onClick={() => chooseScenario(scenario.id)} aria-pressed={selectedId === scenario.id}><span className="scenario-radio">{selectedId === scenario.id && <i />}</span>{safest && <span className="scenario-badge">✦ LOWEST RISK</span>}<span className="scenario-name">{scenario.label}</span><strong>{scenario.id === 'skip' ? '₹0' : money(scenario.amount)}</strong><small>{scenario.description}</small><span className="scenario-forecast-label">PROJECTED MONTH-END</span><span className={`scenario-forecast ${scenario.metrics.forecast < 0 ? 'text-danger' : ''}`}>{money(scenario.metrics.forecast)}</span><span className="scenario-scenario-risk"><span className={`risk-mini-dot ${riskTone(scenario.metrics.riskLabel)}`} />{scenario.metrics.riskLabel} RISK</span></button>; })}</div>
        <div className="scenario-table-wrap"><table className="scenario-table"><thead><tr><th>OUTCOME</th>{scenarios.map((scenario) => <th key={scenario.id} className={selectedId === scenario.id ? 'selected-col' : ''}>{scenario.label.toUpperCase()}</th>)}</tr></thead><tbody><tr><td>Balance after decision</td>{scenarios.map((scenario) => <td key={scenario.id} className={selectedId === scenario.id ? 'selected-col' : ''}>{money(scenario.metrics.balance)}</td>)}</tr><tr><td>Safe-to-spend / day</td>{scenarios.map((scenario) => <td key={scenario.id} className={selectedId === scenario.id ? 'selected-col' : ''}>{money(scenario.metrics.safeToSpend)}</td>)}</tr><tr><td>Runway</td>{scenarios.map((scenario) => <td key={scenario.id} className={selectedId === scenario.id ? 'selected-col' : ''}>{scenario.metrics.runwayDays == null ? '—' : `${Math.floor(scenario.metrics.runwayDays)} days`}</td>)}</tr><tr><td>Health</td>{scenarios.map((scenario) => <td key={scenario.id} className={selectedId === scenario.id ? 'selected-col' : ''}>{scenario.metrics.healthScore}/100</td>)}</tr><tr><td>Risk</td>{scenarios.map((scenario) => <td key={scenario.id} className={selectedId === scenario.id ? 'selected-col' : ''}><span className={`table-risk ${riskTone(scenario.metrics.riskLabel)}`}>{scenario.metrics.riskLabel}</span></td>)}</tr></tbody></table></div>
        <div className="scenario-recommendation"><div className="recommendation-star"><Sparkles size={16} /></div><div><strong>{scenarios.reduce((best, item) => item.metrics.riskScore < best.metrics.riskScore ? item : best, scenarios[0]).label} keeps your options most open.</strong><p>Based on the lowest projected risk score in this comparison. The final choice is still yours.</p></div><button onClick={() => chooseScenario(scenarios.reduce((best, item) => item.metrics.riskScore < best.metrics.riskScore ? item : best, scenarios[0]).id)}>View safest <ArrowRight size={14} /></button></div>
      </section>
      <DecisionImpact before={currentBefore} after={selected.metrics} />
      <DominoEffect before={currentBefore} after={selected.metrics} />
    </div>}
  </div>;
}
