import { create } from "zustand";

interface RoomState {
  code: string | null;
  role: "host" | "player" | null;
  playerId: number | null;
  setRoom: (code: string, role: "host" | "player", playerId?: number) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  code: null,
  role: null,
  playerId: null,
  setRoom: (code, role, playerId) =>
    set({ code, role, playerId: playerId ?? null }),
  reset: () => set({ code: null, role: null, playerId: null }),
}));
