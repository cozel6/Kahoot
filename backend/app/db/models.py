from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.domain.game_session import GameState
from app.domain.quiz import QuestionType


class QuizModel(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    questions: Mapped[list["QuestionModel"]] = relationship(
        back_populates="quiz",
        cascade="all, delete-orphan",
        order_by="QuestionModel.order_index",
    )


class QuestionModel(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    quiz_id: Mapped[int] = mapped_column(
        ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False
    )
    text: Mapped[str] = mapped_column(String(500), nullable=False)
    type: Mapped[QuestionType] = mapped_column(
        SAEnum(QuestionType, name="question_type"), nullable=False
    )
    time_limit_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=20_000)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)

    quiz: Mapped[QuizModel] = relationship(back_populates="questions")
    options: Mapped[list["AnswerOptionModel"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="AnswerOptionModel.order_index",
    )


class AnswerOptionModel(Base):
    __tablename__ = "answer_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"), nullable=False
    )
    text: Mapped[str] = mapped_column(String(300), nullable=False)
    is_correct: Mapped[bool] = mapped_column(nullable=False, default=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)

    question: Mapped[QuestionModel] = relationship(back_populates="options")


class GameSessionModel(Base):
    __tablename__ = "game_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(6), unique=True, nullable=False, index=True)
    quiz_id: Mapped[int] = mapped_column(
        ForeignKey("quizzes.id", ondelete="RESTRICT"), nullable=False
    )
    state: Mapped[GameState] = mapped_column(
        SAEnum(GameState, name="game_state"),
        nullable=False,
        default=GameState.LOBBY,
    )
    current_question_idx: Mapped[int] = mapped_column(Integer, nullable=False, default=-1)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    quiz: Mapped[QuizModel] = relationship()
    players: Mapped[list["PlayerModel"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
    )


class PlayerModel(Base):
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(
        ForeignKey("game_sessions.id", ondelete="CASCADE"), nullable=False
    )
    nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    session: Mapped[GameSessionModel] = relationship(back_populates="players")
    answers: Mapped[list["SubmittedAnswerModel"]] = relationship(
        back_populates="player",
        cascade="all, delete-orphan",
    )


class SubmittedAnswerModel(Base):
    __tablename__ = "submitted_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    player_id: Mapped[int] = mapped_column(
        ForeignKey("players.id", ondelete="CASCADE"), nullable=False
    )
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"), nullable=False
    )
    option_idx: Mapped[int] = mapped_column(Integer, nullable=False)
    elapsed_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    points_awarded: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    player: Mapped[PlayerModel] = relationship(back_populates="answers")