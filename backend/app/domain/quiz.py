from dataclasses import dataclass, field
from enum import Enum

class QuestionType(str, Enum):
    TRUE_FALSE = "true_false"
    MULTIPLE_CHOICE = "multiple_choice"

@dataclass(slots=True)
class AnswerOption:
    text: str
    is_correct: bool = False

@dataclass(slots=True)
class Question:
    text:str
    type:QuestionType
    options: list[AnswerOption]
    time_limit_ms: int = 20_000

    @property
    def correct_index(self) -> int:
        for inx, opt in enumerate(self.options):
            if opt.is_correct:
                return inx
        raise ValueError("Questions must have at least one correct answer option")
        
@dataclass(slots=True)
class Quiz:
    title:str
    questions: list[Question] = field(default_factory=list)
    id: int | None = None