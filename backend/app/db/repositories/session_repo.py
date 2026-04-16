from sqlalchemy import select
import sqlalchemy
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.room_codes import generate_room_code
from app.db.models import (
    GameSessionModel,
    PlayerModel,
    QuizModel,
    QuestionModel,
)
from app.domain.game_session import GameState

class SessionRepository:
    MAX_CODE_ATTEMPTS = 10 # if needed, value should be 5 or less to avoid performance issues
    
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_with_unique_code(self, quiz_id: int) -> GameSessionModel:
        """Creates a new game session with a unique room code."""
        for _ in range(self.MAX_CODE_ATTEMPTS):
            code = generate_room_code()
            exists = await self.session.scalar(
                select(GameSessionModel.id).where(GameSessionModel.code == code)
            )
            if exists is None:
                model = GameSessionModel(
                    code=code,
                    quiz_id=quiz_id,
                    state=GameState.LOBBY
                )
                self.session.add(model)
                model.players = []  # ensure players relationship is initialized
                await self.session.flush()
                return model
        raise Exception("Failed to generate a unique room code after multiple attempts.")

    async def get_by_code(self, code: str) -> GameSessionModel | None:
        stmt = (
            select(GameSessionModel)
            .where(GameSessionModel.code == code)
            .options(
                selectinload(GameSessionModel.players),
                selectinload(GameSessionModel.quiz)
                .selectinload(QuizModel.questions)
                .selectinload(QuestionModel.options),
            )
        )
        return await self.session.scalar(stmt)

    async def update_state(
        self, session_model: GameSessionModel, new_state: GameState
    ) -> None:
        session_model.state = new_state
        await self.session.flush()

    async def add_player(
        self, session_model: GameSessionModel, nickname: str
    ) -> PlayerModel:
        player = PlayerModel(session_id=session_model.id, nickname=nickname)
        self.session.add(player)
        await self.session.flush()
        return player