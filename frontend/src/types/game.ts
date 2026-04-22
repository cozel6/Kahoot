import type { Player } from "./player";

export type GameState = "lobby" | "in_progress" | "finished";

export interface RoomOut {
  id: number;
  code: string;
  quiz_id: number;
  state: GameState;
  players: Player[];
}

export interface JoinResponse {
  room: RoomOut;
  player: Player;
}
