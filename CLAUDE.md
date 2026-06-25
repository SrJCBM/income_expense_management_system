# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Income Expense Management System — a full-stack financial tracking app (web + Electron desktop). Users can record income/expenses, manage budgets and categories, view reports with charts, and export data to PDF/Excel.

## Commands

### Backend (`cd backend`)
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Production server
npm test             # Run all Vitest tests
npm run test:watch   # Watch mode
npm run test:coverage
```

### Frontend (`cd frontend`)
```bash
npm run dev          # Vite dev server on port 3000
npm run build        # Build for production
npm run electron-dev # Electron app with hot-reload
npm run cypress      # Open Cypress UI
npm run cypress:run  # Run E2E tests headless
npm run test:e2e     # All E2E tests
npm run test:a11y    # Accessibility tests
npm run build:dist   # Build Windows installer (NSIS)
```

### Running a single Vitest test
```bash
cd backend && npx vitest run tests/unit/someFile.test.js
```

### Running a single Cypress spec
```bash
cd frontend && npx cypress run --spec "cypress/e2e/expenses.cy.js"
```

## Environment Setup

**Backend** — create `backend/.env` from `backend/.env.example`. Key vars:
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — signing key for tokens
- `FRONTEND_URL` — CORS origin (default `http://localhost:3000`)
- `PORT` — defaults to 5000

**Frontend** — create `frontend/.env` from `frontend/.env.example`. Key vars:
- `VITE_API_URL` — backend base URL (default `http://localhost:5000/api`)
- `VITE_AUTH_MODE` — set to `mock` to bypass real auth in dev

## Architecture

### Backend — Model-Controller-Service (REST API)
```
Request → Middleware (JWT / validation) → Route → Controller → Service → Model → MongoDB
```
- **Models** (`src/models/`) — Mongoose schemas: `User`, `Expense`, `Income`, `Category`, `Budget`
- **Services** (`src/services/`) — all business logic lives here; controllers only coordinate HTTP
- **Controllers** (`src/controllers/`) — handle req/res, delegate to services
- **Validators** (`src/validators/`) — express-validator chains, applied as middleware on routes
- **Middlewares** — `authMiddleware.js` (JWT), `errorHandler.js` (global error catching)
- Entry point: `backend/server.js` — registers routes under `/api/*`

### Frontend — React SPA + optional Electron shell
```
Page/Component → Custom Hook → Service (Axios) → Backend API
```
- **Pages** (`src/pages/`) — one file per route: Dashboard, Expenses, Incomes, Categories, Budgets, Reports, Profile, Login, Register
- **Hooks** (`src/hooks/`) — domain hooks encapsulate state + API calls: `useAuth`, `useExpenses`, `useIncomes`, `useCategories`, `useBudgets`, `useExport`
- **Services** (`src/services/`) — Axios wrappers per domain; `api.js` is the shared Axios instance with JWT interceptors and auto-logout on 401
- **Context** (`src/context/SettingsContext.jsx`) — app-wide settings (currency, etc.)
- **Constants** (`src/constants/apiEndpoints.js`) — all API URLs defined here; import from here instead of hardcoding
- Router: `HashRouter` (required for Electron file:// URLs)
- Auth tokens stored in `localStorage` under keys `authToken` / `authUser`

### Data Models
| Model    | Key fields                                                          |
|----------|---------------------------------------------------------------------|
| User     | name, email, password (bcrypt), role (user/admin), currency        |
| Expense  | userId, description, amount, category, date, notes, tags           |
| Income   | userId, description, amount, category, date, notes                 |
| Category | userId, name, type (expense/income), color, icon                   |
| Budget   | userId, category, limitAmount, month, year, alertThreshold         |

### API Base URL
`http://localhost:5000/api` — routes: `/auth`, `/expenses`, `/incomes`, `/categories`, `/budgets`, `/reports`, `/users`

## Testing

- **Backend:** Vitest + Supertest + `mongodb-memory-server` for isolation. Tests under `backend/tests/unit/` and `backend/tests/integration/`. Coverage threshold: 70%.
- **Frontend:** Cypress E2E under `frontend/cypress/e2e/`. Accessibility via `cypress-axe`. Viewport 1280×720. Fixtures in `cypress/fixtures/`, custom commands in `cypress/support/commands.js`.

## Desktop Build

`cd frontend && npm run build:dist` produces a Windows NSIS installer at `frontend/release/`. It bundles the Vite-built React app and the Node.js backend into a single executable. The backend runs on port 5000 inside the Electron process.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
