import { create } from "zustand";
import type { Player } from "@/types/player";
import type { AnswerAckMsg, QuestionEndMsg, QuestionMsg } from "@/types/ws-messages";

interface GameState {
  players: Player[];
  currentQuestion: QuestionMsg | null;
  answerResult: AnswerAckMsg | null;
  questionResult: QuestionEndMsg | null;
  finalLeaderboard: Player[] | null;
  hasAnswered: boolean;

  addPlayer: (player: Player) => void;
  setQuestion: (msg: QuestionMsg) => void;
  setAnswerResult: (result: AnswerAckMsg) => void;
  setQuestionResult: (result: QuestionEndMsg) => void;
  setFinalLeaderboard: (leaderboard: Player[]) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  players: [],
  currentQuestion: null,
  answerResult: null,
  questionResult: null,
  finalLeaderboard: null,
  hasAnswered: false,

  addPlayer: (player) =>
    set((s) => ({ players: [...s.players, player] })),
  setQuestion: (msg) =>
    set({ currentQuestion: msg, answerResult: null, questionResult: null, hasAnswered: false }),
  setAnswerResult: (result) =>
    set({ answerResult: result, hasAnswered: true }),
  setQuestionResult: (result) =>
    set({ questionResult: result }),
  setFinalLeaderboard: (leaderboard) =>
    set({ finalLeaderboard: leaderboard }),
  reset: () =>
    set({
      players: [],
      currentQuestion: null,
      answerResult: null,
      questionResult: null,
      finalLeaderboard: null,
      hasAnswered: false,
    }),
}));
