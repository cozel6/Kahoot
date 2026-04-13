from dataclasses import dataclass


@dataclass(slots=True)
class Player:
    nickname: str
    id: int | None = None
    session_id: int | None = None
    score: int = 0