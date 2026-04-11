from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
async def heatlth() -> dict[str, str]:
    return {"status": "ok"}