# Project: vibecheck
## Stack: Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 + better-sqlite3 + Recharts + shadcn/ui

Mood/vibe tracking web app with local SQLite storage and trend visualization charts. Built with Next.js App Router, shadcn/ui components, Recharts for data visualization, and Turbopack.

## Commands
- Dev: `npm run dev` (uses Turbopack)
- Build: `npm run build` (uses Turbopack)
- Start: `npm run start`
- Lint: `npm run lint`

## Key Paths
- `src/app/` -- Next.js App Router pages and API routes
- `src/app/page.tsx` -- main page
- `src/app/api/` -- API route handlers
- `src/components/` -- React components
- `src/components/TrendChart.tsx` -- Recharts-based trend visualization
- `src/lib/db.ts` -- SQLite database connection (better-sqlite3)
- `src/lib/colors.ts` -- color/theme utilities
- `src/lib/utils.ts` -- shared utilities (clsx + tailwind-merge)
- `components.json` -- shadcn/ui configuration

## Rules
- TypeScript strict mode
- React functional components with hooks only
- Use shadcn/ui components (Base UI + Tailwind CSS 4)
- SQLite via better-sqlite3 for local persistence
- Use Recharts for all data visualization
- Use `date-fns` for date manipulation
- Tailwind CSS 4 via `@tailwindcss/postcss`
- Named exports over default exports
- Follow conventional commits (feat:, fix:, chore:)
