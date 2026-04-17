from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import GameSessionModel, PlayerModel, QuestionModel
from app.db.repositories.player_repo import PlayerRepository
from app.db.repositories.session_repo import SessionRepository
from app.domain.game_session import GameState
from app.services.scoring_service import calculate_points


@dataclass(slots=True)
class AnswerResult:
    is_correct: bool
    points_awarded: int
    total_score: int

class GameServiceError(Exception):
    """Invalid flow: operation not allowed in current game state"""

class GameService:
    def __init__(self, session: AsyncSession) -> None:
        self.db = session
        self.sessions = SessionRepository(session)
        self.players = PlayerRepository(session)

    async def create_room(self, quiz_id: int) -> GameSessionModel:
        return await self.sessions.create_with_unique_code(quiz_id)

    async def join_room(
        self, code: str, nickname: str
    ) -> tuple[GameSessionModel, PlayerModel]:
        session_model = await self.sessions.get_by_code(code)
        if session_model is None:
            raise GameServiceError(f"Room {code} does not exist.")
        if session_model.state != GameState.LOBBY:
            raise GameServiceError("The game has already started, you can no longer join.")
        if any(p.nickname == nickname for p in session_model.players):
            raise GameServiceError(
                f"The nickname '{nickname}' is already in use in this room."
            )
        player = await self.sessions.add_player(session_model, nickname)
        return session_model, player

    async def start_game(self, code: str) -> GameSessionModel:
        session_model = await self._get_or_raise(code)
        if session_model.state != GameState.LOBBY:
            raise GameServiceError("The game is not in the LOBBY state.")
        if not session_model.players:
            raise GameServiceError("You cannot start a game without players.")
        session_model.state = GameState.IN_PROGRESS
        session_model.current_question_idx = 0
        await self.db.flush()
        return session_model

    async def advance_question(self, code: str) -> QuestionModel | None:
        """Advances to the next question. If there are no more questions, finishes the game and returns None."""
        session_model = await self._get_or_raise(code)
        if session_model.state != GameState.IN_PROGRESS:
            raise GameServiceError("The game is not in progress.")
        session_model.current_question_idx += 1
        questions = session_model.quiz.questions
        if session_model.current_question_idx >= len(questions):
            session_model.state = GameState.FINISHED
            await self.db.flush()
            return None
        await self.db.flush()
        return questions[session_model.current_question_idx]

    async def current_question(
        self, session_model: GameSessionModel
    ) -> QuestionModel | None:
        idx = session_model.current_question_idx
        questions = session_model.quiz.questions
        if 0 <= idx < len(questions):
            return questions[idx]
        return None

    async def submit_answer(
        self,
        code: str,
        player_id: int,
        option_idx: int,
        elapsed_ms: int,
    ) -> AnswerResult:
        session_model = await self._get_or_raise(code)
        if session_model.state != GameState.IN_PROGRESS:
            raise GameServiceError("There is no active question.")

        question = await self.current_question(session_model)
        if question is None:
            raise GameServiceError("There is no current question.")

        player = await self.players.get_by_id(player_id)
        if player is None or player.session_id != session_model.id:
            raise GameServiceError("Player does not belong to this room.")

        correct_idx = next(
            (i for i, opt in enumerate(question.options) if opt.is_correct), -1
        )
        is_correct = option_idx == correct_idx
        points = calculate_points(is_correct, elapsed_ms, question.time_limit_ms)

        await self.players.record_answer(
            player=player,
            question_id=question.id,
            option_idx=option_idx,
            elapsed_ms=elapsed_ms,
            points_awarded=points,
        )
        return AnswerResult(
            is_correct=is_correct,
            points_awarded=points,
            total_score=player.score,
        )

    async def leaderboard(self, code: str) -> list[PlayerModel]:
        session_model = await self._get_or_raise(code)
        return sorted(session_model.players, key=lambda p: p.score, reverse=True)

    async def _get_or_raise(self, code: str) -> GameSessionModel:
        session_model = await self.sessions.get_by_code(code)
        if session_model is None:
            raise GameServiceError(f"Room {code} does not exist.")
        return session_model