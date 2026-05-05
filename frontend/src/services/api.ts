import type { JoinResponse, RoomOut } from "@/types/game";
import type { QuizCreate, QuizOut, QuizSummary } from "@/types/quiz";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}

export const api = {
  listQuizzes: () => request<QuizSummary[]>("/quizzes"),

  getQuiz: (id: number) => request<QuizOut>(`/quizzes/${id}`),

  createQuiz: (payload: QuizCreate) =>
    request<QuizOut>("/quizzes/", { method: "POST", body: JSON.stringify(payload) }),

  deleteQuiz: (id: number) =>
    request<void>(`/quizzes/${id}`, { method: "DELETE" }),

  createRoom: (quizId: number) =>
    request<RoomOut>("/rooms", { method: "POST", body: JSON.stringify({ quiz_id: quizId }) }),

  joinRoom: (code: string, nickname: string) =>
    request<JoinResponse>(`/rooms/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ nickname }),
    }),
};
