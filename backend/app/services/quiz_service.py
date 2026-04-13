from collections.abc import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import QuizModel
from app.db.repositories.quiz_repo import QuizRepository
from app.domain.quiz import Quiz

class QuizService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = QuizRepository(session)
            
    async def create_quiz(self, quiz: Quiz) -> QuizModel:
        if not quiz.questions:
            raise ValueError("Quiz must have at least one question")
        for q in quiz.questions:
            correct = sum(1 for o in q.options if o.is_correct)
            if correct != 1:
                raise ValueError(f"Question {q.text} must have exactly one correct option")
        return await self.repo.create_quiz(quiz)
    
    async def list_quizzes(self) -> Sequence[QuizModel]:
        return await self.repo.list()
    
    async def get_quiz(self, quiz_id: int) -> QuizModel | None:
        return await self.repo.get_by_id(quiz_id)
    
    async def delete_quiz(self, quiz_id: int) -> None:
        await self.repo.delete_quiz(quiz_id)