import type { FinanceState, Transaction, Commitment, Goal } from '../types/finance';

const transactions: Transaction[] = [
  { id: 'tx-1', type: 'expense', amount: 180, category: 'Food', description: 'Breakfast & chai', day: 1 },
  { id: 'tx-2', type: 'expense', amount: 120, category: 'Transport', description: 'Metro + auto', day: 2 },
  { id: 'tx-3', type: 'expense', amount: 240, category: 'Food', description: 'Lunch with friends', day: 3 },
  { id: 'tx-4', type: 'expense', amount: 350, category: 'Entertainment', description: 'Movie night', day: 4 },
  { id: 'tx-5', type: 'expense', amount: 190, category: 'Food', description: 'Dinner', day: 5 },
  { id: 'tx-6', type: 'expense', amount: 140, category: 'Transport', description: 'Local train & auto', day: 6 },
  { id: 'tx-7', type: 'expense', amount: 900, category: 'Shopping', description: 'Everyday essentials', day: 7 },
  { id: 'tx-8', type: 'expense', amount: 220, category: 'Food', description: 'Lunch', day: 8 },
  { id: 'tx-9', type: 'expense', amount: 300, category: 'Entertainment', description: 'Weekend plans', day: 9 },
  { id: 'tx-10', type: 'expense', amount: 280, category: 'Food', description: 'Dinner + dessert', day: 10 },
  { id: 'tx-11', type: 'expense', amount: 160, category: 'Transport', description: 'Cab split', day: 11 },
  { id: 'tx-12', type: 'expense', amount: 300, category: 'Food', description: 'Lunch & coffee', day: 12 },
];

const commitments: Commitment[] = [
  { id: 'cm-1', name: 'Netflix', amount: 649, dueDay: 15, category: 'Entertainment', recurring: true },
  { id: 'cm-2', name: 'Spotify', amount: 119, dueDay: 18, category: 'Entertainment', recurring: true },
  { id: 'cm-3', name: 'Gym membership', amount: 999, dueDay: 22, category: 'Health', recurring: true },
];

const goals: Goal[] = [
  { id: 'goal-1', name: 'Goa Trip', targetAmount: 5000, currentAmount: 3200, targetDay: 30 },
];

export function createSeedState(): FinanceState {
  return {
    challenge: { startingBudget: 10000, totalDays: 30, currentDay: 12 },
    transactions: transactions.map((item) => ({ ...item })),
    commitments: commitments.map((item) => ({ ...item })),
    goals: goals.map((item) => ({ ...item })),
    settings: { currency: 'INR', reducedMotion: false },
  };
}
