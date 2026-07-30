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

- Frontend: Vercel (`frontend/`)
- Backend: Render or Railway (run uvicorn command)
- Set `BACKEND_URL` to your backend URL in Vercel (server-side only — do not expose `GOOGLE_API_KEY` to the client)

## Contributors

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the full list of team members.
