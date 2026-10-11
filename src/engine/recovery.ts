import type { FinanceState } from '../types/finance';
import { calculateFinancialMetrics } from './calculations';

export interface RecoverySuggestion {
  id: string;
  title: string;
  detail: string;
  savings: number;
}

export function getRecoverySuggestions(state: FinanceState): RecoverySuggestion[] {
  const metrics = calculateFinancialMetrics(state);
  const suggestions: RecoverySuggestion[] = [];
  const shopping = state.transactions.filter((tx) => tx.type === 'expense' && tx.category === 'Shopping' && tx.day <= state.challenge.currentDay).reduce((sum, tx) => sum + tx.amount, 0);
  if (shopping > 0) suggestions.push({ id: 'shopping', title: 'Pause non-essential shopping', detail: `Keep the next purchase in your wishlist. You've spent ₹${Math.round(shopping).toLocaleString('en-IN')} on shopping so far.`, savings: Math.round(Math.min(shopping * 0.25, 800)) });
  const food = state.transactions.filter((tx) => tx.type === 'expense' && tx.category === 'Food' && tx.day <= state.challenge.currentDay).reduce((sum, tx) => sum + tx.amount, 0);
  if (food > 0) suggestions.push({ id: 'food', title: 'Trim food delivery for a few days', detail: 'Swap one delivery for a simple meal and redirect the difference to your buffer.', savings: Math.round(Math.min(food * 0.12, 500)) });
  const nextSubscription = state.commitments.filter((item) => item.dueDay > state.challenge.currentDay).sort((a, b) => b.amount - a.amount)[0];
  if (nextSubscription) suggestions.push({ id: nextSubscription.id, title: `Review ${nextSubscription.name}`, detail: 'If you can pause it without a penalty, simulate how the month changes.', savings: nextSubscription.amount });
  if (!suggestions.length) suggestions.push({ id: 'buffer', title: 'Protect your daily buffer', detail: 'Keep discretionary spending below your safe-to-spend number until the next commitment clears.', savings: Math.max(0, Math.round(metrics.safeToSpend * 2)) });
  return suggestions.sort((a, b) => b.savings - a.savings).slice(0, 3);
}
