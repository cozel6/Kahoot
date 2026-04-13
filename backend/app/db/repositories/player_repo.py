from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import PlayerModel, SubmittedAnswerModel

class PlayerRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, player_id: int) -> PlayerModel | None:
        return await self.session.get(PlayerModel, player_id)
    
    async def record_answer(
            self,
            player: PlayerModel,
            question_id: int,
            option_idx: int,
            elapsed_ms: int,
            points_awarded: int
    ) -> SubmittedAnswerModel:
        answer = SubmittedAnswerModel(
            player_id=player.id,
            question_id=question_id,
            option_idx=option_idx,
            elapsed_ms=elapsed_ms,
            points_awarded=points_awarded
        )
        player.score += points_awarded
        self.session.add(answer)
        await self.session.flush()
        return answer