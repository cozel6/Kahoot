import type { Player } from "./player";

export interface WsQuestionOption {
  text: string;
}

export interface PlayerJoinedMsg {
  type: "player_joined";
  player: Player;
}

export interface QuestionMsg {
  type: "question";
  index: number;
  total: number;
  text: string;
  options: WsQuestionOption[];
  time_limit_ms: number;
}

export interface AnswerAckMsg {
  type: "answer_ack";
  is_correct: boolean;
  points_awarded: number;
  total_score: number;
}

export interface QuestionEndMsg {
  type: "question_end";
  correct_idx: number;
  leaderboard: Player[];
}

export interface GameEndMsg {
  type: "game_end";
  final_leaderboard: Player[];
}

export interface ErrorMsg {
  type: "error";
  message: string;
}

export type ServerWsMessage =
  | PlayerJoinedMsg
  | QuestionMsg
  | AnswerAckMsg
  | QuestionEndMsg
  | GameEndMsg
  | ErrorMsg;

export interface HostStartMsg {
  type: "host_start";
}

export interface HostNextMsg {
  type: "host_next";
}

export interface PlayerAnswerMsg {
  type: "player_answer";
  option_idx: number;
  elapsed_ms: number;
}

export type ClientWsMessage = HostStartMsg | HostNextMsg | PlayerAnswerMsg;
