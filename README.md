# AI Career Copilot

**Discover your skills. Build your career.** A premium AI career mentor powered by **Gemma 4** for the [Build with Gemma](https://ai.google.dev/) hackathon.

Adaptive assessments, personalized roadmaps, ATS-ready resumes, internship matching, and mock interviews — all guided by Gemma with a unified **Navigator Index** that tracks your progress

## Features

- **Adaptive Skill Assessment** — Gemma asks technical questions based on your answers
- **Learning Roadmap** — Personalized milestones, resources, and timeline
- **Resume Builder** — ATS-optimized resumes with job tailoring and scoring
- **Internship Matcher** — Explainable recommendations with gap analysis
- **Mock Interview** — Role-specific practice with Route Score feedback
- **Progress Dashboard** — Navigator Index, charts, and career activity history
- **Personalized onboarding** — New users choose Biology, High School, 9th & 10th, or Developer and get a custom roadmap

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **AI** | Gemma 4 (`gemma-4-27b-it`) via Google GenAI SDK |
| **Backend** | Python, FastAPI, MongoDB (Motor) |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Auth** | Firebase email + Google (local demo if keys are missing) |

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

- **Website:** https://gemma-hackathon-v1mh.vercel.app


One command starts **both** the FastAPI backend and Next.js frontend. The frontend proxies `/api/*` to the backend — no CORS setup required.

### Environment variables

**Backend** — copy `.env.example` to `.env` in the project root:

```env
GOOGLE_API_KEY=your_google_api_key_here
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=career_copilot
FIREBASE_PROJECT_ID=your-firebase-project-id
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env.local` and add your Firebase web config (`NEXT_PUBLIC_FIREBASE_*`). Enable **Email/Password** and **Google** in the Firebase Console → Authentication.

Without Firebase keys the app stays in local demo login. With keys, new users pick a track (Biology, High School, 9th & 10th, Developer) and answer a short quiz so Gemma can build a custom roadmap.

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
| `FIREBASE_PROJECT_ID` | Yes for live login | Firebase project ID |
| `CORS_ORIGINS` | No | e.g. `https://your-app.vercel.app` |

Also set these on the **frontend** service:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes for live login | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Same project id as the backend |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase app id |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | No | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | No | Messaging sender id |

Add your Vercel domain under Firebase Authentication → Settings → Authorized domains.

4. Deploy. Routing:
   - `/api/*` → FastAPI backend
   - `/ws/*` → WebSocket (mock interview)
   - all other paths → Next.js frontend

`BACKEND_URL` is injected automatically via service binding. `NEXT_PUBLIC_WS_URL` is optional — omit to use same-origin `wss://` in production.

### Split deploy (alternative)

**Frontend (Vercel)** — set Root Directory to `frontend`:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes for live login | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project id |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase app id |

**Backend (Railway / Render):**

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Set `GOOGLE_API_KEY` and `MONGODB_URI` on the backend host only.
