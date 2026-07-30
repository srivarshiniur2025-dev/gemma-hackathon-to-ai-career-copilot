# AI Career Copilot

**Discover your skills. Build your career.** A premium AI career mentor powered by **Gemma 4** for the [Build with Gemma](https://ai.google.dev/) hackathon.

Adaptive assessments, personalized roadmaps, ATS-ready resumes, internship matching, and mock interviews — all guided by Gemma with a unified **Navigator Index** that tracks your progress.

## Features

- **Adaptive Skill Assessment** — Gemma asks technical questions based on your answers
- **Learning Roadmap** — Personalized milestones, resources, and timeline
- **Resume Builder** — ATS-optimized resumes with job tailoring and scoring
- **Internship Matcher** — Explainable recommendations with gap analysis
- **Mock Interview** — Role-specific practice with Route Score feedback
- **Progress Dashboard** — Navigator Index, charts, and career activity history

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **AI** | Gemma 4 (`gemma-4-27b-it`) via Google GenAI SDK |
| **Backend** | Python, FastAPI, MongoDB (Motor) |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Auth** | Demo mode locally; Firebase-ready for production |

## Quick Start

### Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- **MongoDB** (optional locally — backend runs in degraded demo mode without it)

### Clone & run (integrated)

1. Clone this repository from GitHub (**Code → Clone**).
2. Open the project folder in your terminal.
3. Run:

```powershell
npm run install:all
npm run dev
```

- **Website:** http://localhost:3000
- **API (direct):** http://127.0.0.1:8000
- **Health check (via proxy):** http://localhost:3000/api/health

One command starts **both** the FastAPI backend and Next.js frontend. The frontend proxies `/api/*` to the backend — no CORS setup required.

### Environment variables

**Backend** — copy `.env.example` to `.env` in the project root:

```env
GOOGLE_API_KEY=your_google_api_key_here
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=career_copilot
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env.local`:

```env
BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8000
```

**Never commit `.env` files or hardcode API keys.** All Gemma calls run server-side in FastAPI only; the frontend never receives the Google API key.

Without `GOOGLE_API_KEY`, the app runs in **demo mode** with mock assessment, internship, and interview data.

### Run separately (optional)

**Backend:**
```powershell
py -m pip install -r requirements.txt
py -m uvicorn backend.main:app --reload --port 8000
```

**Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

## Hackathon Demo Flow

1. **Landing page** — scroll through the career journey → **Get Started**
2. **Onboarding** — fill profile → **Dashboard**
3. **Skill Assessment** — answer adaptive Gemma questions
4. **Roadmap** — generate a personalized learning plan
5. **Resume** — build and ATS-optimize your resume
6. **Internships** — get matched opportunities with explanations
7. **Mock Interview** — practice with live feedback and Route Score

## Project Structure

```
ai-career-copilot/
├── backend/          # FastAPI + Gemma services
├── frontend/         # Next.js app (landing + dashboard)
├── vercel.json       # Full-stack deploy config
├── pyproject.toml    # Python project metadata
└── package.json      # Root dev scripts (npm run dev)
```

## Deploy

### Full-stack on Vercel (recommended)

Root `vercel.json` uses Vercel **Services** (Next.js + FastAPI).

1. Import this GitHub repository in [Vercel](https://vercel.com/new).
2. **Root Directory:** repository root (`.`).
3. Add environment variables for the **backend** service:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Gemma / Google AI — backend only |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `MONGODB_DB` | No | Default: `career_copilot` |
| `FIREBASE_PROJECT_ID` | For prod auth | Firebase project ID |
| `CORS_ORIGINS` | No | e.g. `https://your-app.vercel.app` |

4. Deploy. Routing:
   - `/api/*` → FastAPI backend
   - `/ws/*` → WebSocket (mock interview)
   - all other paths → Next.js frontend

`BACKEND_URL` is injected automatically via service binding. `NEXT_PUBLIC_WS_URL` is optional — omit to use same-origin `wss://` in production.

### Split deploy (alternative)

**Frontend (Vercel)** — set Root Directory to `frontend`:

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_URL` | Yes | FastAPI URL for Next.js rewrites |
| `NEXT_PUBLIC_WS_URL` | Yes | WebSocket URL for interviews |

**Backend (Railway / Render):**

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Set `GOOGLE_API_KEY` and `MONGODB_URI` on the backend host only.
