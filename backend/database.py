from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from backend.config import settings

_client: AsyncIOMotorClient | None = None
_mongo_ok: bool | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=800,
            connectTimeoutMS=800,
            socketTimeoutMS=2000,
        )
    return _client


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[settings.mongodb_db]


def is_mongo_available() -> bool:
    return _mongo_ok is not False


def set_mongo_available(ok: bool) -> None:
    global _mongo_ok
    _mongo_ok = ok


async def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
