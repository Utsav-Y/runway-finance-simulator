import type { FinanceMetrics, FinanceState, HealthBreakdown } from '../types/finance';

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const safeDivide = (numerator: number, denominator: number, fallback = 0) =>
  denominator > 0 ? numerator / denominator : fallback;

function riskFromComponents(state: FinanceState, forecast: number, runwayDays: number | null, upcoming: number, savingsReserve: number, balance: number, daysRemaining: number) {
  const budget = Math.max(state.challenge.startingBudget, 1);
  const forecastRisk = forecast < -budget * 0.25 ? 100 : forecast < -budget * 0.1 ? 85 : forecast < 0 ? 65 : forecast < budget * 0.1 ? 55 : forecast < budget * 0.2 ? 40 : forecast < budget * 0.35 ? 25 : 10;
  const runwayRatio = runwayDays === null ? 1.5 : runwayDays / Math.max(daysRemaining, 1);
  const runwayRisk = runwayRatio < 0.35 ? 100 : runwayRatio < 0.6 ? 78 : runwayRatio < 0.85 ? 54 : runwayRatio < 1 ? 27 : 5;
  const commitmentRatio = safeDivide(upcoming, Math.max(balance, 1));
  const commitmentRisk = commitmentRatio > 0.4 ? 100 : commitmentRatio > 0.25 ? 76 : commitmentRatio > 0.15 ? 51 : commitmentRatio > 0.08 ? 26 : 5;
  const goalRatio = safeDivide(savingsReserve, Math.max(balance, 1));
  const goalRisk = goalRatio > 0.6 ? 100 : goalRatio > 0.4 ? 74 : goalRatio > 0.25 ? 51 : goalRatio > 0.1 ? 27 : 5;
  const score = Math.round(forecastRisk * 0.4 + runwayRisk * 0.3 + commitmentRisk * 0.15 + goalRisk * 0.15);
  const label = score < 25 ? 'LOW' : score < 50 ? 'MODERATE' : score < 75 ? 'HIGH' : 'CRITICAL';
  return { score: clamp(score), label: label as FinanceMetrics['riskLabel'] };
}

function calculateHealth(state: FinanceState, balance: number, forecast: number, totalSpent: number, upcoming: number, savingsReserve: number): { score: number; label: FinanceMetrics['healthLabel']; breakdown: HealthBreakdown } {
  const budget = Math.max(state.challenge.startingBudget, 1);
  const daysElapsed = Math.max(state.challenge.currentDay, 1);
  const averagePerDay = totalSpent / daysElapsed;
  const budgetStability = Math.round(30 * clamp((forecast / budget + 0.15) / 0.65));
  const spendingControl = Math.round(25 * clamp((budget * 0.7 - averagePerDay * daysElapsed) / (budget * 0.7)));
  const totalGoalTarget = state.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalGoalSaved = state.goals.reduce((sum, goal) => sum + Math.min(goal.currentAmount, goal.targetAmount), 0);
  const savingsProgress = totalGoalTarget > 0 ? Math.round(20 * clamp(totalGoalSaved / totalGoalTarget)) : 15;
  const commitmentLoad = Math.round(15 * (1 - clamp(safeDivide(upcoming, Math.max(balance, 1)) / 0.6)));
  const emergencyBuffer = Math.round(10 * clamp(Math.max(0, balance - upcoming - savingsReserve) / (budget * 0.25)));
  const breakdown: HealthBreakdown = { budgetStability, spendingControl, savingsProgress, commitmentLoad, emergencyBuffer };
  const score = clamp(Object.values(breakdown).reduce((sum, value) => sum + value, 0));
  const label = score >= 85 ? 'Excellent' : score >= 70 ? 'Healthy' : score >= 50 ? 'Building stability' : 'Needs attention';
  return { score, label, breakdown };
}

export function calculateFinancialMetrics(state: FinanceState): FinanceMetrics {
  const { startingBudget, totalDays, currentDay } = state.challenge;
  const day = clamp(currentDay, 1, totalDays);
  const daysRemaining = Math.max(1, totalDays - day + 1);
  const daysAfterToday = Math.max(0, totalDays - day);
  const completed = state.transactions.filter((item) => item.day <= day);
  const futurePlanned = state.transactions.filter((item) => item.day > day);
  const totalSpent = completed.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = completed.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const balance = startingBudget + totalIncome - totalSpent;
  const upcoming = state.commitments.filter((item) => item.dueDay > day).reduce((sum, item) => sum + item.amount, 0);
  const savingsReserve = state.goals
    .filter((goal) => goal.targetDay >= day)
    .reduce((sum, goal) => sum + Math.max(0, goal.targetAmount - goal.currentAmount), 0);
  const safeBalance = balance - upcoming - savingsReserve;
  const elapsedDays = Math.max(1, day);
  // Project future behavior from days before today so a one-off purchase being tested
  // does not get extrapolated across every remaining day of the challenge.
  const priorDaySpend = state.transactions
    .filter((item) => item.type === 'expense' && item.day < day)
    .reduce((sum, item) => sum + item.amount, 0);
  const priorDays = Math.max(0, day - 1);
  const averageDailySpend = priorDays > 0 && priorDaySpend > 0 ? priorDaySpend / priorDays : totalSpent / elapsedDays;
  const dailyAllowance = balance / daysRemaining;
  const safeToSpend = safeBalance / daysRemaining;
  const futurePlannedSpend = futurePlanned.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const futureIncome = futurePlanned.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const forecast = balance + futureIncome - averageDailySpend * daysAfterToday - upcoming - futurePlannedSpend;
  const spendableBalance = Math.max(0, safeBalance);
  const runwayDays = averageDailySpend <= 0 ? null : Math.max(0, spendableBalance / averageDailySpend);
  const risk = riskFromComponents(state, forecast, runwayDays, upcoming, savingsReserve, balance, daysRemaining);
  const health = calculateHealth(state, balance, forecast, totalSpent, upcoming, savingsReserve);
  const goalTarget = state.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const goalCurrent = state.goals.reduce((sum, goal) => sum + Math.min(goal.currentAmount, goal.targetAmount), 0);
  const goalProgress = goalTarget > 0 ? clamp((goalCurrent / goalTarget) * 100) : 0;

  return {
    balance,
    totalSpent,
    totalIncome,
    upcomingCommitments: upcoming,
    savingsReserve,
    safeBalance,
    dailyAllowance,
    safeToSpend,
    forecast,
    averageDailySpend,
    runwayDays,
    riskScore: risk.score,
    riskLabel: risk.label,
    healthScore: health.score,
    healthLabel: health.label,
    healthBreakdown: health.breakdown,
    daysRemaining,
    goalProgress,
  };
}

export function calculateCategorySpend(state: FinanceState) {
  const day = state.challenge.currentDay;
  const totals: Record<string, number> = {};
  state.transactions
    .filter((item) => item.type === 'expense' && item.day <= day)
    .forEach((item) => { totals[item.category] = (totals[item.category] || 0) + item.amount; });
  return Object.entries(totals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function calculateForecastTimeline(state: FinanceState) {
  const { startingBudget, totalDays, currentDay } = state.challenge;
  const sortedTransactions = [...state.transactions].sort((a, b) => a.day - b.day);
  const commitmentsByDay = new Map<number, number>();
  state.commitments.forEach((item) => commitmentsByDay.set(item.dueDay, (commitmentsByDay.get(item.dueDay) || 0) + item.amount));
  const metrics = calculateFinancialMetrics(state);
  const afterToday = Math.max(0, totalDays - currentDay);
  const dailySpend = metrics.averageDailySpend;
  let rolling = startingBudget;
  const rows: { day: number; actual: number | null; projected: number | null; commitment?: boolean }[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const dayTransactions = sortedTransactions.filter((item) => item.day === d);
    if (d <= currentDay) {
      for (const tx of dayTransactions) rolling += tx.type === 'income' ? tx.amount : -tx.amount;
      if (d === currentDay) {
        rows.push({ day: d, actual: rolling, projected: rolling });
      } else {
        rows.push({ day: d, actual: rolling, projected: null });
      }
    } else {
      rolling -= dailySpend;
      for (const tx of dayTransactions) rolling += tx.type === 'income' ? tx.amount : -tx.amount;
      const commitment = commitmentsByDay.get(d) || 0;
      rolling -= commitment;
      rows.push({ day: d, actual: null, projected: rolling, commitment: commitment > 0 });
    }
  }
  // Keep the projection aligned with the same future commitments and expense assumptions used by the metric engine.
  if (afterToday === 0 && rows.length) rows[rows.length - 1].projected = rows[rows.length - 1].actual;
  return rows;
}
