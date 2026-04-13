from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import AnswerOptionModel, QuestionModel, QuizModel
from app.domain.quiz import Quiz

class QuizRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, quiz: Quiz) -> QuizModel:
        model = QuizModel(title=quiz.title)
        for q_idx, q in enumerate(quiz.questions):
            q_model = QuestionModel(
                text=q.text,
                type=q.type,
                time_limit_ms=q.time_limit_ms,
                order_index=q_idx,
                options=[
                    AnswerOptionModel(
                        text=opt.text,
                        is_correct=opt.is_correct,
                        order_index=o_idx,
                    )
                    for o_idx, opt in enumerate(q.options)
                ],
            )
            model.questions.append(q_model)
        self.session.add(model)
        await self.session.flush()
        return model
    
    async def get_by_id(self, quiz_id: int) -> QuizModel | None:
        stmt = (
            select(QuizModel)
            .where(QuizModel.id == quiz_id)
            .options(
                selectinload(QuizModel.questions).selectinload(QuestionModel.options)
            )
        )
        return await self.session.scalar(stmt)
    
    async def delete(self, quiz_id:int) -> None:
        model = await self.session.get(QuizModel, quiz_id)
        if model is None:
            return False
        await self.session.delete(model)
        return True