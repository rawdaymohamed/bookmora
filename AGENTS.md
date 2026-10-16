
# Booking SaaS — Development Instructions

## Project
A Next.js appointment booking SaaS for small businesses.

## Technology
- Next.js App Router
- TypeScript (strict)
- Tailwind CSS
- PostgreSQL
- Prisma ORM 7
- Vitest and React Testing Library
- npm

## Architecture
- Routes and pages belong in src/app.
- Shared UI belongs in src/components.
- Feature-specific UI belongs in src/features.
- Database utilities belong in src/server/db.
- Business logic belongs in src/server/services.
- Validate untrusted input on the server.
- Keep route handlers thin.
- Prefer simple, reusable functions.

## Development Rules
1. Read the task acceptance criteria before coding.
2. Make the smallest change that satisfies the task.
3. Avoid unrelated refactoring.
4. Do not add unnecessary dependencies.
5. Never commit secrets or real customer data.
6. Do not run destructive database operations without approval.
7. Add or update relevant tests.
8. Run lint, typecheck, tests, and build.
9. Explain any failed checks or unresolved risks.

## Current Scope
BK-01: Project foundation only.
Do not implement authentication, booking APIs,
service CRUD, or payments in this issue.

## Completion Report
Include:
- Files changed
- Behavior implemented
- Commands executed and results
- Remaining limitations
