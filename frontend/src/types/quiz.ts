export type QuestionType = "true_false" | "multiple_choice";

export interface AnswerOptionOut {
  id: number;
  text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuestionOut {
  id: number;
  text: string;
  type: QuestionType;
  time_limit_ms: number;
  order_index: number;
  options: AnswerOptionOut[];
}

export interface QuizOut {
  id: number;
  title: string;
  questions: QuestionOut[];
}

export interface QuizSummary {
  id: number;
  title: string;
}

export interface AnswerOptionIn {
  text: string;
  is_correct: boolean;
}

export interface QuestionIn {
  text: string;
  type: QuestionType;
  time_limit_ms: number;
  options: AnswerOptionIn[];
}

export interface QuizCreate {
  title: string;
  questions: QuestionIn[];
}
