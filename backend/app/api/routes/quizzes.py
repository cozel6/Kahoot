from fastapi import APIRouter, HTTPException, status

from app.api.deps import DBSession
from app.domain.quiz import AnswerOption, Question, Quiz
from app.schemas.quiz import QuizCreate, QuizOut, QuizSummary
from app.services.quiz_service import QuizService

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

def to_domain(payload: QuizCreate) -> Quiz:
    """Convert QuizCreate to Quiz domain model."""
    return Quiz(
        title=payload.title,
        questions=[
            Question(
                text=q.text,
                type=q.type,
                time_limit_ms=q.time_limit_ms,
                options=[
                    AnswerOption(
                        text=o.text,
                        is_correct=o.is_correct
                    ) for o in q.options
                ]
            ) for q in payload.questions
        ],
    )

@router.post("/", response_model=QuizOut, status_code=status.HTTP_201_CREATED)
async def create_quiz(payload: QuizCreate, db: DBSession) -> QuizOut:
    service = QuizService(db)
    try:
        model = await service.create_quiz(to_domain(payload))
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    return QuizOut.model_validate(model)

@router.get("/", response_model=list[QuizSummary])
async def list_quizzes(db: DBSession) -> list[QuizSummary]:
    service = QuizService(db)
    quizzes = await service.list_quizzes()
    return [QuizSummary.model_validate(q) for q in quizzes]


@router.get("/{quiz_id}", response_model=QuizOut)
async def get_quiz(quiz_id: int, db: DBSession) -> QuizOut:
    service = QuizService(db)
    model = await service.get_quiz(quiz_id)
    if model is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Quiz {quiz_id} not found")
    return QuizOut.model_validate(model)


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(quiz_id: int, db: DBSession) -> None:
    service = QuizService(db)
    deleted = await service.delete_quiz(quiz_id)
    if not deleted:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Quiz {quiz_id} not found")