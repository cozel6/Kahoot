from fastapi import APIRouter, HTTPException, status

from app.api.deps import DBSession
from app.schemas.room import JoinResponse, PlayerOut, RoomCreate, RoomJoin, RoomOut
from app.services.game_service import GameService, GameServiceError

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.post("", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
async def create_room(payload: RoomCreate, db: DBSession) -> RoomOut:

    service = GameService(db)
    try:
        session_model = await service.create_room(payload.quiz_id)
    except GameServiceError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    return RoomOut.model_validate(session_model)
        
@router.post("/{code}/join", response_model=JoinResponse)
async def join_room(code: str, payload: RoomJoin, db: DBSession) -> JoinResponse:
    service = GameService(db)
    try:
        session_model, player = await service.join_room(code.upper(), payload.nickname)
    except GameServiceError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    return JoinResponse(
        room=RoomOut.model_validate(session_model),
        player=PlayerOut.model_validate(player),
    )
