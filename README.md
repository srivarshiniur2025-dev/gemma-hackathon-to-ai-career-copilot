# AI Career Copilot

An intelligent career mentor powered by **Gemma** for the Build with Gemma hackathon.

## Features

- **Adaptive Skill Assessment** — Gemma asks technical questions based on your answers
- **Learning Roadmap** — Personalized milestones and resources
- **Resume Builder** — ATS-optimized resumes with job tailoring
- **Internship Matcher** — Explainable recommendations with gap analysis
- **Mock Interview** — Role-specific practice with feedback
- **Progress Tracking** — Career activity and skill history

## Quick Start (integrated)

Run **both** frontend and backend with one command from the project root:

```powershell
cd "C:\Users\Srivarshini UR\Projects\gemma-hackathon"
npm install
npm run dev
```

- **Website:** http://localhost:3000
- **API (direct):** http://127.0.0.1:8000
- **API (via frontend proxy):** http://localhost:3000/api/health

The Next.js app proxies all `/api/*` requests to the FastAPI backend, so the frontend and backend work as one integrated app with no CORS issues.

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

### Environment variables

Copy `.env.example` to `.env` in the project root and set your Google API key:

```
GOOGLE_API_KEY=your_google_api_key_here
```

**Never commit `.env` or hardcode API keys in source files.** All Gemma/Google AI calls run server-side in the FastAPI backend only; the Next.js frontend proxies `/api/*` to the backend and does not receive the key.

`GEMINI_API_KEY` is still accepted by the backend for backward compatibility, but `GOOGLE_API_KEY` is preferred.

## Tech Stack

- **AI:** Gemma 4 (`gemma-4-26b-a4b-it`) via Gemini API
- **Backend:** Python, FastAPI
- **Frontend:** Next.js, React, Tailwind CSS
- **Storage:** JSON file (MVP — swap for Firebase/MongoDB in production)

## Hackathon Demo Flow

1. Landing page → **Get Started**
2. Fill onboarding form → **Dashboard**
3. **Skill Assessment** → answer 5–6 adaptive questions
4. **Roadmap** → generate personalized plan
5. **Resume** → generate + optional ATS optimize
6. **Internships** → get matched opportunities
7. **Mock Interview** → practice and get score

## Deploy

### Full-stack on Vercel (recommended)

Root `vercel.json` uses Vercel **Services** (Next.js + FastAPI). Root `pyproject.toml` sets `entrypoint = "backend.main:app"` so Vercel finds the FastAPI app.

1. Import the GitHub repo in [Vercel](https://vercel.com/new).
2. **Root Directory:** leave as repository root (`.`).
3. **Framework Preset:** should detect **Services** from `vercel.json`.
4. Add environment variables for the **backend** service (Project → Settings → Environment Variables):

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Gemma / Google AI — backend only, never on frontend |
| `MONGODB_URI` | Yes | e.g. MongoDB Atlas connection string |
| `MONGODB_DB` | No | Default: `career_copilot` |
| `FIREBASE_PROJECT_ID` | Yes | Firebase Auth |
| `CORS_ORIGINS` | No | Your Vercel URL, e.g. `https://your-app.vercel.app` |

5. Deploy. Routing:
   - `/api/*` → FastAPI backend
   - `/ws/*` → FastAPI WebSocket (mock interview)
   - all other paths → Next.js frontend

`BACKEND_URL` is injected for SSR via service binding. `NEXT_PUBLIC_WS_URL` is optional — omit it to use same-origin `wss://` in production.

**Note:** WebSockets and MongoDB on serverless have cold-start and duration limits; use MongoDB Atlas.

### Split deploy (alternative)

#### Frontend (Vercel)

1. Set **Root Directory** to `frontend`.
2. Set environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_URL` | Yes (for live API) | FastAPI backend URL — server-side only, used by Next.js rewrites |
| `NEXT_PUBLIC_WS_URL` | Yes (for live interviews) | WebSocket URL, e.g. `wss://your-app.railway.app` |

**Do not** set `GOOGLE_API_KEY` on Vercel frontend — Gemma calls run on the backend only.

Without `BACKEND_URL`, the app runs in **demo mode** with mock data for assessment, internships, and interviews.

#### Backend (Railway / Render)

Deploy the FastAPI backend separately:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Set `GOOGLE_API_KEY` and `MONGODB_URI` on the backend host only.

## Contributors

| GitHub | Role |
|--------|------|
| [@srivarshiniur2025-dev](https://github.com/srivarshiniur2025-dev) | Project lead |
| [@NarainKarthicNS](https://github.com/NarainKarthicNS) | Contributor |
| [@gamini2025-win](https://github.com/gamini2025-win) | Contributor |
| [@monicsathyaki07](https://github.com/monicsathyaki07) | Contributor |

> **Note:** GitHub's **Contributors** tab lists people who have **committed code** to this repo. Invited collaborators appear under **Settings → Collaborators** after they accept their invite. See also [CONTRIBUTORS.md](CONTRIBUTORS.md).
