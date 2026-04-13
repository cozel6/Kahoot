from pydantic import BaseModel, ConfigDict, Field

from app.domain.game_session import GameState


class RoomCreate(BaseModel):
    quiz_id: int


class RoomJoin(BaseModel):
    nickname: str = Field(..., min_length=1, max_length=50)


class PlayerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nickname: str
    score: int


class RoomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    quiz_id: int
    state: GameState
    players: list[PlayerOut]


class JoinResponse(BaseModel):
    room: RoomOut
    player: PlayerOut