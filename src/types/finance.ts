export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Bills'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Other',
];

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: Category;
  description: string;
  day: number;
  isUnexpected?: boolean;
}

export interface Commitment {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: Category;
  recurring?: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDay: number;
}

export interface Challenge {
  startingBudget: number;
  totalDays: number;
  currentDay: number;
}

export interface FinanceState {
  challenge: Challenge;
  transactions: Transaction[];
  commitments: Commitment[];
  goals: Goal[];
  settings: { currency: 'INR'; reducedMotion?: boolean };
}

export interface HealthBreakdown {
  budgetStability: number;
  spendingControl: number;
  savingsProgress: number;
  commitmentLoad: number;
  emergencyBuffer: number;
}

export interface FinanceMetrics {
  balance: number;
  totalSpent: number;
  totalIncome: number;
  upcomingCommitments: number;
  savingsReserve: number;
  safeBalance: number;
  dailyAllowance: number;
  safeToSpend: number;
  forecast: number;
  averageDailySpend: number;
  runwayDays: number | null;
  riskScore: number;
  riskLabel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  healthScore: number;
  healthLabel: 'Needs attention' | 'Building stability' | 'Healthy' | 'Excellent';
  healthBreakdown: HealthBreakdown;
  daysRemaining: number;
  goalProgress: number;
}

export interface DecisionImpact {
  label: 'LOW' | 'MODERATE' | 'HIGH';
  tone: 'good' | 'warn' | 'danger';
  summary: string;
}

export interface ScenarioResult {
  id: string;
  label: string;
  description: string;
  amount: number;
  delayDays: number;
  metrics: FinanceMetrics;
  state: FinanceState;
}

export type PageId = 'dashboard' | 'simulator' | 'money' | 'goals' | 'commitments' | 'insights';
