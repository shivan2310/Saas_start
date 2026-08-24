# Nivio

Nivio is a private personal organizer built with Next.js, TypeScript, Tailwind CSS, Supabase Auth, and Supabase Postgres.

## Features

- **Dashboard** - Overview of tasks, dates, journal entries, and expenses
- **Tasks** - Create, complete, and manage todos with due dates
- **Important Dates** - Track birthdays, anniversaries, and events
- **Journal** - Encrypted diary entries with local-first encryption
- **Expenses** - Track spending with categories, trends, and visualizations
- **Dark/Light Mode** - System-aware theme switching
- **Email Verification** - Supabase Auth with email confirmation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Email/Password)
- **Charts**: Custom SVG-based visualizations (DonutChart, LineChart)

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard routes
│   │   ├── expenses/      # Expense tracking page with charts
│   │   ├── tasks/         # Task management
│   │   ├── dates/         # Important dates
│   │   └── diary/         # Journal entries
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── DonutChart.tsx # Circular spending visualization
│   │   ├── ExpenseChart.tsx # Bar chart for expenses
│   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   └── TopNavbar.tsx  # Top navigation bar
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── context/               # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and validations
├── services/              # Business logic & Supabase queries
├── supabase/              # Database schema & migrations
└── types/                 # TypeScript type definitions
```

## DonutChart Component

Located at `components/dashboard/DonutChart.tsx` - A complete circular pie/donut chart showing spending by category.

### Features

- **Complete 360° ring** - No gaps, angles sum to exactly 360°
- **Precise calculations** - Segment angle = (category amount / total) × 360°
- **Distinct colors** - 9 visually separable colors (sage, orange, blue, purple, gold, teal, pink, red, brown)
- **Center display** - Large bold total amount with "TOTAL" label
- **Dark theme card** - #161616 background with rounded corners
- **Sorted legend** - Categories by descending amount with amounts and percentages
- **Zero-value exclusion** - Automatically filters out categories with ₹0
- **Income exclusion** - Salary category excluded from spending chart

### Usage

```tsx
import { DonutChart } from "@/components/dashboard/DonutChart";

const categories = [
  { name: "Shopping", amount: 500, color: "#8FAFA5" },
  { name: "Food", amount: 40, color: "#E8A87C" },
  { name: "Transport", amount: 120, color: "#A8D0E6" },
  // ... more categories
];

<DonutChart
  categories={categories}
  size={280}
  strokeWidth={60}
/>;
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `categories` | `SpendingCategory[]` | Default demo data | Array of category objects |
| `size` | `number` | `280` | Diameter of the chart in pixels |
| `strokeWidth` | `number` | `60` | Thickness of the donut ring |

### SpendingCategory Type

```ts
interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}
```

### Color Palette

The chart uses these distinct colors (defined in `app/dashboard/expenses/page.tsx`):

```ts
const CHART_COLORS = [
  "#8FAFA5", // Sage (primary)
  "#E8A87C", // Warm sand
  "#A8D0E6", // Muted blue
  "#D4A5D4", // Muted lavender
  "#F4C47C", // Muted gold
  "#9DD4B8", // Muted mint
  "#E6A8A8", // Muted coral
  "#B8C8E6", // Muted periwinkle
];
```

### Math Verification

For the default data (total ₹1,700):

| Category | Amount | Angle | Percentage |
|----------|--------|-------|------------|
| Shopping | ₹500 | 105.88° | 29.4% |
| Bills | ₹300 | 63.53° | 17.6% |
| Home | ₹250 | 52.94° | 14.7% |
| Travel | ₹200 | 42.35° | 11.8% |
| Education | ₹150 | 31.76° | 8.8% |
| Transport | ₹120 | 25.41° | 7.1% |
| Health | ₹80 | 16.94° | 4.7% |
| Entertainment | ₹60 | 12.71° | 3.5% |
| Food | ₹40 | 8.47° | 2.4% |
| **Total** | **₹1,700** | **360°** | **100%** |

## Local Setup

1. Create a Supabase project
2. In Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql)
3. Enable email/password auth and configure the site URL plus redirect URLs (`http://localhost:3000/dashboard` and your production equivalent)
4. Copy `.env.example` to `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run `npm run dev` to start the app

All application tables use Row Level Security. Each row is tied to `auth.uid()`, so users can only access their own profile and Nivio data.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Deployment

Deploy to Vercel with the environment variables configured. Ensure Supabase redirect URLs include your production domain.