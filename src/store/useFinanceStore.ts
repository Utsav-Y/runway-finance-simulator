import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FinanceState, Transaction, Commitment, Goal } from '../types/finance';
import { createSeedState } from '../data/seedData';

interface FinanceStore extends FinanceState {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addCommitment: (commitment: Omit<Commitment, 'id'>) => void;
  deleteCommitment: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setCurrentDay: (day: number) => void;
  resetDemo: () => void;
  loadScenario: (state: FinanceState) => void;
}

const seed = createSeedState();

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      ...seed,
      addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, { ...transaction, id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }],
      })),
      deleteTransaction: (id) => set((state) => ({ transactions: state.transactions.filter((item) => item.id !== id) })),
      addCommitment: (commitment) => set((state) => ({
        commitments: [...state.commitments, { ...commitment, id: `cm-${Date.now()}` }],
      })),
      deleteCommitment: (id) => set((state) => ({ commitments: state.commitments.filter((item) => item.id !== id) })),
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, { ...goal, id: `goal-${Date.now()}` }] })),
      updateGoal: (id, patch) => set((state) => ({ goals: state.goals.map((goal) => goal.id === id ? { ...goal, ...patch } : goal) })),
      deleteGoal: (id) => set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) })),
      setCurrentDay: (day) => set((state) => ({ challenge: { ...state.challenge, currentDay: Math.min(state.challenge.totalDays, Math.max(1, day)) } })),
      resetDemo: () => set(() => ({ ...createSeedState() })),
      loadScenario: (nextState) => set(() => ({ ...nextState })),
    }),
    {
      name: 'runway-finance-state',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        challenge: state.challenge,
        transactions: state.transactions,
        commitments: state.commitments,
        goals: state.goals,
        settings: state.settings,
      } as FinanceStore),
    },
  ),
);
