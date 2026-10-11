# RUNWAY — See the consequence before you spend

RUNWAY is a 30-day financial decision simulator built for the PROMPT RUN hackathon. It focuses on one differentiator: simulate a purchase, compare the consequences, and commit only when ready.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Built with

- React + TypeScript + Vite
- Tailwind CSS (base utility setup) and a custom responsive design system
- Zustand + localStorage persistence
- Lightweight SVG/CSS charts for actual/projected balance and category visualization
- Lucide React icons
- Motion for transitions

## Product areas

- **Overview:** current balance, safe-to-spend, forecast, runway, health, risk, 30-day timeline and transaction preview.
- **Simulator:** deterministic simulation, before/after results, scenario comparison and domino-effect metrics.
- **Money:** add/delete expenses and income, category breakdown and editable transaction ledger.
- **Goals:** create and delete savings goals; inspect remaining amount and required daily pace.
- **Commitments:** track upcoming fixed costs and add/remove commitments.
- **Insights:** transparent rule-based health breakdown, signals and recovery ideas.

## Financial model notes

All derived figures are calculated by pure functions in `src/engine`. Goal progress is tracked as a separate earmarked target; current goal savings are not subtracted from the balance a second time. Upcoming commitments and remaining goal targets reduce safe-to-spend. The month-end projection uses the historical average spend per elapsed challenge day plus future commitments and explicitly planned future transactions.

A simulation clones the input state and never mutates the store. State changes only when a scenario is committed. The current challenge state persists in localStorage under `runway-finance-state`; use **Reset demo data** to restore the seeded Day 12 challenge.

## Before a final hackathon submission

- Run the app at desktop, tablet and mobile widths.
- Test the full simulate → compare → commit → dashboard path.
- Test adding and deleting a transaction, goal and commitment.
- Run `npm run build` and resolve any issues in your target coding environment.

## Product thesis

**RUNWAY — See the consequence before you spend.**

RUNWAY is intentionally different from a conventional budget dashboard. The primary action is not categorizing yesterday's spend; it is **simulating a decision before money leaves**. The engine compares four futures — Buy now, Spend less, Wait 2 days, or Skip — and exposes the downstream effect on balance, safe-to-spend, forecast, runway, health, and risk.

### Core loop

`TRACK → SIMULATE → COMPARE → SEE THE DOMINO EFFECT → DECIDE`

## Architecture

```text
src/
├── components/        Reusable visual primitives and decision-story components
├── data/               Seed challenge data
├── engine/             Pure financial calculations, simulation and recovery rules
├── pages/              Feature-level page components
├── store/              Zustand state + localStorage persistence
├── types/              Shared domain types
└── App.tsx             Workspace shell and page-level lazy loading
```

Business calculations stay in `src/engine`; pages consume derived metrics instead of duplicating financial formulas. Simulation works on a cloned state and only mutates persisted state when a user explicitly commits a scenario.

## Financial model

The model is deterministic and explainable:

- **Balance:** starting budget + income − completed expenses.
- **Safe-to-spend:** current balance − upcoming commitments − remaining goal reserve, divided across the remaining days.
- **Forecast:** current position projected forward using observed spending pace plus future fixed/planned obligations.
- **Runway:** spendable balance divided by average daily spend, with zero-spend and negative cases handled safely.
- **Risk:** weighted forecast, runway, commitment load and goal pressure signals.
- **Health:** budget stability, spending control, savings progress, commitment load and emergency buffer.

No external API or AI service is required to calculate a result, so the same input state produces the same simulation output.

## Signature UX

### Decision Impact Profile

After a simulation, RUNWAY summarizes the magnitude of the decision with forecast, runway and risk deltas. This is a planning visualization — not financial advice — and it helps the user understand whether a choice is a small adjustment or a month-shaping event.

### Domino Effect

The selected scenario is rendered as **Before → Decision → After**, then traced through six consequences. This is the product's signature interaction and is deliberately more explanatory than a conventional budget chart.

## Responsive strategy

The interface uses desktop sidebar navigation, a compact tablet layout, and a mobile bottom navigation bar. At narrow widths, dense ledger rows become stacked transaction cards, simulator panels collapse to one column, forms move to one-column layouts, and scenario options become vertically stacked. Interactive controls retain visible focus states and usable touch targets.

## Performance strategy

Feature pages are lazy-loaded so the workspace shell does not eagerly ship every page's JavaScript. Heavy visualization code is isolated by route where possible. The project avoids external runtime services and keeps persisted data local to the browser.

## Accessibility

- Semantic buttons and labeled form controls.
- Visible `:focus-visible` indicators.
- `aria-current`, `aria-pressed`, live status messaging and dialog semantics where appropriate.
- Reduced-motion media support.
- Responsive layouts that avoid requiring horizontal page scrolling at mobile widths.
- Local-only persistence; no account or server is required.

## Submission checklist

1. `npm run build`
2. Test Overview, Simulator, Money, Goals, Commitments and Insights.
3. Test the simulator flow: **simulate → compare → select → commit → dashboard**.
4. Test add/delete transaction, goal and commitment.
5. Test desktop, tablet and mobile widths, including a 320px-wide viewport.
6. Refresh after a change to confirm local persistence.
7. Verify the production deployment before the final hackathon submission.

