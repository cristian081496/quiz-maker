# Quiz Maker Application

This repository hosts a full-stack quiz platform built with Next.js 15 on the frontend and an Express API backed by SQLite. It includes tooling for building quizzes, managing attempts, and grading responses.

## Local Setup

### Prerequisites
- Node.js 18+ (tested with 18.20.x)
- npm 9+ (ships with Node 18)

### 1. Clone the repo
```bash
git clone https://github.com/cristian081496/quiz-maker.git
cd bookipi
```

### 2. Back-end: install & run
```bash
cd backend
npm install          # insstall dependencies
npm run seed         # bootstraps the SQLite database with sample data
npm run dev          # serves the API on http://localhost:4000
```

The API expects an `Authorization: Bearer dev-token` header by default.

### 3. Front-end: install & run
```bash
cd frontend
npm install          # install dependencies
npm run dev          # runs Next.js on http://localhost:3000
```

Create `frontend/.env.local` (see Environment below) before starting the dev server so requests point to the local API.

### 4. Environment
`frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_TOKEN=dev-token
```

The backend reads `API_TOKEN` from `.env.local` (defaults to `dev-token`), so there is nothing else to configure for local work.

## Architecture Notes & Trade-offs

- **Next.js App Router + React 19**: Chosen for server/client component flexibility and file-system routing, I used this as well so i can showcase my skills on implementing react on this framework.
- **TanStack Query v5**: Handles caching, revalidation, and optimistic updates around quiz fetching. It keeps React components mostly declarativen; worth it for consistent server-state management
- **shadcn/ui + Tailwind v4**: Gives a consistent design baseline with on-demand components. The trade-off is maintaining the generated component files ourselves, but it keeps us from getting locked into a black-box UI kit
- **Service-oriented frontend utilities**: API operations live in small service modules so hooks/components stay slim. There’s a bit more boilerplate up front, but it pays off when screens or API contracts change.

also, I didn’t implement features that aren’t in the user flow, even though the API is available. One example is reordering and deleting questions and I made the UI simple but neat for now, but we can improve if needed

## Anti-cheat & Attempt Logging

The backend records lightweight attempt via `POST /attempts/:id/events`. The client emits events such as switvhing tabs and pastes; they are stored in the `attempt_events` table along with timestamps, so you can try to switch tab and copy and pasting and it should be detected.

## Handy Commands

Frontend (`frontend/`)
- `npm run dev` — Next.js with Turbopack
- `npm run build` — production bundle
- `npm run lint` — lint the project

Backend (`backend/`)
- `npm run dev` — Express + nodemon
- `npm run seed` — reset database contents
- `npm test` — Jest suite
- `npm run test:coverage` — coverage report

Make sure to run `npm install` and `npm run dev` inside **both** `backend/` and `frontend/` any time you pull fresh changes or set up a new machine. It saves you from mismatched dependencies and keeps the two servers in sync.
