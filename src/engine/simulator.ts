import type { DecisionImpact, FinanceMetrics, FinanceState, ScenarioResult, Transaction } from '../types/finance';
import { calculateFinancialMetrics } from './calculations';

function cloneFinanceState(state: FinanceState): FinanceState {
  return {
    challenge: { ...state.challenge },
    transactions: state.transactions.map((item) => ({ ...item })),
    commitments: state.commitments.map((item) => ({ ...item })),
    goals: state.goals.map((item) => ({ ...item })),
    settings: { ...state.settings },
  };
}

export function simulateDecision(
  state: FinanceState,
  input: { amount: number; category: Transaction['category']; description?: string; delayDays?: number },
) {
  const beforeState = cloneFinanceState(state);
  const afterState = cloneFinanceState(state);
  const targetDay = Math.min(state.challenge.totalDays, state.challenge.currentDay + (input.delayDays || 0));
  const hypothetical: Transaction = {
    id: `simulation-${targetDay}-${state.transactions.length}-${input.amount}-${input.category}`, 
    type: 'expense',
    amount: Math.max(0, input.amount),
    category: input.category,
    description: input.description?.trim() || 'Planned purchase',
    day: targetDay,
  };
  afterState.transactions.push(hypothetical);
  const before = calculateFinancialMetrics(beforeState);
  const after = calculateFinancialMetrics(afterState);
  return {
    before,
    after,
    delta: {
      balance: after.balance - before.balance,
      safeToSpend: after.safeToSpend - before.safeToSpend,
      forecast: after.forecast - before.forecast,
      runwayDays: (after.runwayDays ?? 0) - (before.runwayDays ?? 0),
      healthScore: after.healthScore - before.healthScore,
      riskScore: after.riskScore - before.riskScore,
      goalProgress: after.goalProgress - before.goalProgress,
    },
    hypothetical,
    state: afterState,
  };
}

export function getDecisionImpact(before: FinanceMetrics, after: FinanceMetrics): DecisionImpact {
  const riskDelta = after.riskScore - before.riskScore;
  const runwayDelta = (after.runwayDays ?? 0) - (before.runwayDays ?? 0);
  const forecastDelta = after.forecast - before.forecast;
  const severe = riskDelta >= 15 || runwayDelta <= -4 || forecastDelta <= -1500;
  const moderate = riskDelta >= 7 || runwayDelta <= -2 || forecastDelta <= -700;

  if (severe) return {
    label: 'HIGH',
    tone: 'danger',
    summary: 'This decision changes the shape of your month, not just today’s balance.',
  };
  if (moderate) return {
    label: 'MODERATE',
    tone: 'warn',
    summary: 'This decision uses meaningful future flexibility. Compare it before committing.',
  };
  return {
    label: 'LOW',
    tone: 'good',
    summary: 'This decision has a relatively small effect on your projected runway.',
  };
}

export function compareScenarios(state: FinanceState, input: { amount: number; category: Transaction['category']; description?: string }): ScenarioResult[] {
  const smallerAmount = Math.round(input.amount * 0.55);
  const now = simulateDecision(state, { ...input, delayDays: 0 });
  const less = simulateDecision(state, { ...input, amount: smallerAmount, delayDays: 0, description: `${input.description || 'Purchase'} (smaller option)` });
  const wait = simulateDecision(state, { ...input, delayDays: 2 });
  const skip = cloneFinanceState(state);
  return [
    { id: 'buy', label: 'Buy now', description: 'Get it today', amount: input.amount, delayDays: 0, metrics: now.after, state: now.state },
    { id: 'less', label: 'Spend less', description: 'Choose the smaller option', amount: smallerAmount, delayDays: 0, metrics: less.after, state: less.state },
    { id: 'wait', label: 'Wait 2 days', description: 'Keep your cash buffer for now', amount: input.amount, delayDays: 2, metrics: wait.after, state: wait.state },
    { id: 'skip', label: 'Skip it', description: 'Keep your current plan', amount: 0, delayDays: 0, metrics: calculateFinancialMetrics(skip), state: skip },
  ];
}
