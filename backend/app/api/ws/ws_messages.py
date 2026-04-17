from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.room import PlayerOut


# Client → Server

class HostStartMsg(BaseModel):
    type: Literal["host_start"] = "host_start"


class HostNextMsg(BaseModel):
    type: Literal["host_next"] = "host_next"


class PlayerAnswerMsg(BaseModel):
    type: Literal["player_answer"] = "player_answer"
    option_idx: int = Field(..., ge=0, le=3)
    elapsed_ms: int = Field(..., ge=0)


# Server → Client

class PlayerJoinedMsg(BaseModel):
    type: Literal["player_joined"] = "player_joined"
    player: PlayerOut


class QuestionOptionView(BaseModel):
    """What the player SEES — WITHOUT `is_correct`."""
    text: str


class QuestionMsg(BaseModel):
    type: Literal["question"] = "question"
    index: int
    total: int
    text: str
    options: list[QuestionOptionView]
    time_limit_ms: int


class AnswerAckMsg(BaseModel):
    type: Literal["answer_ack"] = "answer_ack"
    is_correct: bool
    points_awarded: int
    total_score: int


class QuestionEndMsg(BaseModel):
    type: Literal["question_end"] = "question_end"
    correct_idx: int
    leaderboard: list[PlayerOut]


class GameEndMsg(BaseModel):
    type: Literal["game_end"] = "game_end"
    final_leaderboard: list[PlayerOut]


class ErrorMsg(BaseModel):
    type: Literal["error"] = "error"
    message: str