# AI Career Copilot — Product Vision

> **Tagline:** Discover Your Skills. Build Your Career.  
> **Core principle:** Every surface is personalized. Gemma powers intelligence; the UI stays premium, calm, and consistent.

---

## Design System (lock across all pages)

| Token | Value | Usage |
|-------|-------|--------|
| Background | `#FAFAFA` | Page shell, subtle premium feel |
| Surface | `#F4F4F5` | Secondary panels |
| Cards | `#FFFFFF` | Content cards, soft shadow |
| Primary | `#18181B` | Headings, primary text |
| Secondary | `#27272A` | Subheadings |
| Accent | `#0D9488` | CTAs, active states, progress |
| Border | `#E4E4E7` | Dividers, card edges |

- **Logo:** AI Career Copilot — charcoal “C” + grad cap + teal arrow (`frontend/components/brand/Logo.tsx`)
- **Typography:** Inter (UI), Sora (display) — large headings, muted gray descriptions
- **Feel:** Linear / Stripe / Vercel — no glassmorphism, no neon, minimal shadows, generous whitespace, large rounded corners (18–22px)
- **Dashboard:** Premium subtle background; icon sidebar (~82px); no visual clutter

---

## 1. Hero / Landing (pre-login)

**Goal:** Very premium first impression — cinematic, authoritative, trustworthy.

- Animated grid / hero workspace cards
- Clear value prop: skills → roadmap → career
- Smooth scroll (Lenis), section reveals
- **Get Started** → login / onboarding

**Status:** Partially built (`HeroSection`, landing sections). Continue polish for “award-winning” feel.

---

## 2. Post-login Dashboard

**Goal:** Command center for productivity, streaks, and career trajectory.

### Must show

- **Productive progress** — completion %, weekly activity, goals met
- **Streak** — daily/weekly learning streak with visual celebration
- **Pictorial representation** — charts, rings, mini sparklines (Recharts)
- **Skill prediction** — Gemma-inferred strengths & gaps from assessment history
- **Career path** — predicted trajectory (role timeline, milestones)

### Layout (reference)

- Left: icon sidebar (Dashboard, Assessment, Roadmap, Resume, Internships, Interview, Progress, Settings)
- Analytics panel: metric cards (Skill Score, ATS Resume Score, Roadmap Progress, Internship Matches)
- Main: profile header + **Learning Timeline / weekly career plan**

**Status:** Dashboard redesign shipped (`/dashboard`, metric cards, timeline). **TODO:** streak UI, skill prediction panel, career path visualization, live data from user profile (not hardcoded demo user).

---

## 3. Side Panel / Navigation

| Item | Purpose |
|------|---------|
| **Skills** | Current skills + **Gemma-recommended skills** for future scope |
| **Assessments** | Personalized certification-style skill tests |
| **Track progress** | History, scores, improvement over time |
| **Planner** | Weekly/daily career plan (timeline tasks) |
| **Internships** | General search + **Gemma Match** |
| **Resume generator** | ATS resume from profile + assessment |

**Status:** Routes exist. **TODO:** unified “Skills + recommended” panel; rename/merge “Roadmap” ↔ planner; wire all nav to personalized data.

---

## 4. Gemma Integration Map

Every intelligent feature runs **server-side** via `GOOGLE_API_KEY` — never exposed on frontend.

| Feature | Gemma role | Implementation |
|---------|------------|----------------|
| **Assessments** | Personalized questions; adaptive difficulty; level detection per chosen/known skill | `backend/services/gemma.py` → `assess_skills` |
| **Skill recommendations** | Predict gaps; suggest skills for target role | Roadmap + dashboard (extend) |
| **Career path** | Predict trajectory from profile + assessment | **TODO** — new Gemma prompt + dashboard widget |
| **Resume generator** | Generate + ATS optimize from profile | `generate_resume`, `optimize_resume` |
| **Internship — general search** | **Gemma + Google Search** across the internet | `search_internships_on_web` + job boards |
| **Internship — Gemma Match** | Rank verified postings; explain fit; gap analysis | `explain_verified_internship_matches` |
| **Spam / fake detection** | Trust score, flags, filter before show | `check_scam` / spam check pipeline |
| **Mock interview** | Questions + evaluation | `interview_simulation` + WebSocket |
| **Roadmap / planner** | Milestones, resources, priority skills | `generate_roadmap` |

---

## 5. Internships (detailed)

### Two modes

1. **General search** — user query + location + skills  
   - Gemma searches the web (Google Search grounding)  
   - Plus optional job boards (Remotive, Arbeitnow, etc.)  
   - Link validation → scam check → sort by trust  

2. **Gemma Match** — profile-driven recommendations  
   - Fetch → validate URLs → **filter spam/fake** (trust ≥ 80)  
   - Gemma explains why each matches; missing skills; improvement plan  

### Spam / fake filtering

- Automated trust score + verdict (`legitimate` / `suspicious` / `scam`)
- User toggle to review flagged listings
- Never surface high-risk postings in default Gemma Match view

**Status:** Built (search, match, scam check, Gemma web search wired). Needs backend + MongoDB live in prod.

---

## 6. Assessments (detailed)

- **Personalized** to target role, known skills, prior answers
- Gemma assesses **level** in each chosen/known skill (beginner → advanced)
- Premium dashboard UI (not chat-only): sidebar domains, question workspace, insights panel, results dashboard
- Certification-style flow with mock fallback when API unavailable

**Status:** Redesign shipped. **TODO:** stronger per-skill level labels on dashboard; sync results to profile for personalization everywhere.

---

## 7. Personalization (whole website)

All pages read from **user profile** (fake-auth local / MongoDB in prod):

- Name, university, target role, skills, interests  
- Assessment results → skills estimate, strengths, weaknesses  
- Roadmap → priority skills, milestones  
- Resume versions, interview scores, internship history  
- Streak + progress counters  

**Rule:** No generic copy when profile exists. Dashboard demo data (e.g. “Monic Sathyaki”) → replace with `AuthContext` user.

**Status:** Partial — demo account works; dashboard still uses hardcoded `dashboard-data.ts`. **TODO:** single source of truth from profile API.

---

## 8. Build priority (hackathon demo)

1. [ ] Wire dashboard to real user profile + assessment scores  
2. [ ] Streak + productivity widgets on dashboard  
3. [ ] Skills panel: current + Gemma recommended future skills  
4. [ ] Career path prediction card (Gemma + visual timeline)  
5. [ ] Planner ↔ dashboard timeline sync  
6. [ ] Hero polish pass (premium consistency)  
7. [ ] MongoDB + backend on Vercel for live Gemma search  
8. [ ] End-to-end demo: login → assess → dashboard updates → Gemma internships → resume  

---

## 9. Demo credentials

- Email: `demo@student.edu`  
- Password: `demo12345`  

---

*Last updated from product notes — Jul 30, 2026*
