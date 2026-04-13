from pydantic import BaseModel, ConfigDict, Field

from app.domain.quiz import QuestionType


# Request (input)

class AnswerOptionIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=300)
    is_correct: bool = False


class QuestionIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    type: QuestionType
    time_limit_ms: int = Field(20_000, ge=5_000, le=120_000)
    options: list[AnswerOptionIn] = Field(..., min_length=2, max_length=4)


class QuizCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    questions: list[QuestionIn] = Field(..., min_length=1, max_length=50)


# Response (output)

class AnswerOptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    text: str
    is_correct: bool
    order_index: int


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    text: str
    type: QuestionType
    time_limit_ms: int
    order_index: int
    options: list[AnswerOptionOut]


class QuizOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    questions: list[QuestionOut]


class QuizSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str