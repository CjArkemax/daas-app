# DAAS — Discipline as a Service

> **"Don't tell me what I planned to do. Show me what I actually did."**

DAAS is a personal execution-tracking application that records focused work sessions and converts them into meaningful daily analytics.

Most productivity tools are just planners. DAAS is a measurement tool. It tracks the actual time you spend on tasks, generating a factual record of your day.

## 🚀 Features (Phase 1 MVP)

- **Authentication:** Secure email/password auth via Supabase.
- **Project & Task Management:** Organize your work into Projects and Tasks. 
- **Global Focus Timer:** A persistent timer overlay that survives navigation and page refreshes.
- **Idempotent Session Saving:** Network drops won't create duplicate sessions (handled via `client_session_id`).
- **Execution Dashboard:** View exactly where your time went today, normalized to your local timezone.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions, React Server Components)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Drizzle ORM
- **State Management:** Zustand (with localStorage persistence)
- **Validation:** Zod
- **Styling:** Tailwind CSS + shadcn/ui
- **Testing:** Vitest (Unit) + Playwright (E2E)

## 🧠 Core Architectural Decisions

DAAS is built on strict data-layer principles to ensure analytics are 100% accurate:

1. **`focus_sessions` is the single source of truth.** Aggregates (daily totals, per-project time) are derived on read. No aggregate columns exist in the database.
2. **Session completion ≠ Task completion.** Ending a timer records the time, but the user must explicitly mark the Task as complete.
3. **Server-side validation.** The client never sends a "duration." It sends `started_at` and `ended_at`. Postgres dynamically calculates `actual_seconds` via a `GENERATED ALWAYS` column.
4. **Timezone-aware.** The database stores UTC. The dashboard converts timestamps to the user's local timezone (via `date-fns/tz`) to calculate exact local-midnight boundaries.

## 🗺️ Data Model

- **Profiles:** 1:1 with Supabase Auth users, stores local timezone.
- **Projects:** Belong to users.
- **Tasks:** Belong to projects. Can be `pending`, `completed`, or `archived`.
- **Focus Sessions:** The immutable ledger. Belongs to a user, project, and task. Features a composite foreign key `(project_id, task_id)` to ensure data integrity.

## 💻 Running Locally

### 1. Clone & Install
```bash
git clone https://github.com/your-username/daas-app.git
cd daas-app
npm install