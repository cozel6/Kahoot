import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GameSocket } from "@/services/socket";
import { useGameStore } from "@/store/gameStore";
import { useRoomStore } from "@/store/roomStore";
import type { ServerWsMessage } from "@/types/ws-messages";

export function PlayerLobbyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const socketRef = useRef<GameSocket | null>(null);

  const playerId = useRoomStore((s) => s.playerId);
  const setQuestion = useGameStore((s) => s.setQuestion);
  const reset = useGameStore((s) => s.reset);

  useEffect(() => {
    if (!code || playerId === null) return;
    reset();

    const socket = new GameSocket(code, "player", playerId);
    socketRef.current = socket;

    socket.onMessage((msg: ServerWsMessage) => {
      if (msg.type === "question") {
        setQuestion(msg);
        navigate(`/player/game/${code}`);
      }
    });

    return () => socket.close();
  }, [code, playerId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page">
      <h1 className="title">You're in!</h1>
      <p className="waiting-text">Waiting for the host to start the game...</p>
    </div>
  );
}
