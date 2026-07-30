from backend.config import settings
from backend.services.gemma import gemma_service
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "model": gemma_service.active_model,
        "model_chain": settings.gemma_model_chain,
        "version": "Gemma 4",
    }
