from dataclasses import dataclass, field
from enum import Enum

from app.domain.player import Player
from app.domain.quiz import Quiz


class GameState(str, Enum):
    LOBBY = "lobby"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"

@dataclass(slots=True)
class GameSession:
    code: str
    quiz: Quiz
    players: list[Player] = field(default_factory=list)
    state: GameState = GameState.LOBBY
    current_question_index: int = -1
    id: int | None = None