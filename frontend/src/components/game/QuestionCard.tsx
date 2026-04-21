import type { QuestionMsg } from "@/types/ws-messages";

interface QuestionCardProps {
  question: QuestionMsg;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div>
      <p className="question-counter">
        Question {question.index + 1} / {question.total}
      </p>
      <div className="question-text">{question.text}</div>
    </div>
  );
}
