interface AnswerButtonProps {
  index: number;
  text: string;
  onClick: () => void;
  disabled?: boolean;
  state?: "idle" | "correct" | "wrong";
}

export function AnswerButton({ index, text, onClick, disabled, state = "idle" }: AnswerButtonProps) {
  const stateClass =
    state === "correct" ? "answer-btn--correct" : state === "wrong" ? "answer-btn--wrong" : "";
  return (
    <button
      className={`answer-btn answer-btn--${index % 4} ${stateClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
