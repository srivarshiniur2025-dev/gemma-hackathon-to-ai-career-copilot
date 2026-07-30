from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.auth import init_firebase
from backend.config import settings
from backend.database import close_db, get_db
from backend.routers import assessment, chat, health, internships, interview, interview_simulation, resume, roadmap, users
from backend.services.gemma import GemmaAuthError, GemmaNetworkError, GemmaRateLimitError

API_PREFIX = "/api"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_firebase()
    db = get_db()
    await db.users.create_index("uid", unique=True)
    await db.interview_sessions.create_index("session_id", unique=True)
    await db.interview_sessions.create_index("uid")
    await db.internship_search_cache.create_index("cache_key", unique=True)
    await db.internship_search_cache.create_index("cached_at")
    yield
    await close_db()


app = FastAPI(title="AI Career Copilot API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(GemmaRateLimitError)
async def gemma_rate_limit_handler(_request: Request, exc: GemmaRateLimitError):
    return JSONResponse(status_code=429, content={"detail": str(exc)})


@app.exception_handler(GemmaAuthError)
async def gemma_auth_handler(_request: Request, exc: GemmaAuthError):
    return JSONResponse(status_code=401, content={"detail": str(exc)})


@app.exception_handler(GemmaNetworkError)
async def gemma_network_handler(_request: Request, exc: GemmaNetworkError):
    return JSONResponse(status_code=503, content={"detail": str(exc)})


app.include_router(health.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(assessment.router, prefix=API_PREFIX)
app.include_router(roadmap.router, prefix=API_PREFIX)
app.include_router(resume.router, prefix=API_PREFIX)
app.include_router(internships.router, prefix=API_PREFIX)
app.include_router(interview.router, prefix=API_PREFIX)
app.include_router(interview_simulation.router, prefix=API_PREFIX)
app.include_router(chat.router, prefix=API_PREFIX)

app.websocket("/ws/interview/{session_id}")(interview_simulation.interview_websocket)
