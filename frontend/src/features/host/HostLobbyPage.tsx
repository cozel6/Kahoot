import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GameSocket } from "@/services/socket";
import { useGameStore } from "@/store/gameStore";
import { useRoomStore } from "@/store/roomStore";
import { useToastStore } from "@/store/toastStore";
import type { ServerWsMessage } from "@/types/ws-messages";
import { Button } from "@/components/ui/Button";

export function HostLobbyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const socketRef = useRef<GameSocket | null>(null);
  const addToast = useToastStore((s) => s.addToast);
  const [starting, setStarting] = useState(false);

  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const setQuestion = useGameStore((s) => s.setQuestion);
  const reset = useGameStore((s) => s.reset);
  const setRoom = useRoomStore((s) => s.setRoom);

  useEffect(() => {
    if (!code) return;
    reset();
    setRoom(code, "host");

    const socket = new GameSocket(code, "host");
    socketRef.current = socket;

    socket.onMessage((msg: ServerWsMessage) => {
      if (msg.type === "player_joined") {
        addPlayer(msg.player);
      } else if (msg.type === "question") {
        setQuestion(msg);
        navigate(`/host/game/${code}`);
      } else if (msg.type === "error") {
        addToast(msg.message);
        setStarting(false);
      }
    });

    return () => socket.close();
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleStart() {
    if (!socketRef.current) return;
    setStarting(true);
    socketRef.current.send({ type: "host_start" });
  }

  return (
    <div className="page">
      <h1 className="title">Room Code</h1>
      <div className="room-code">{code}</div>
      <p className="subtitle">Share this code with your players</p>
      <p className="subtitle">{players.length} player(s) joined</p>
      <ul className="players-list">
        {players.map((p) => (
          <li key={p.id} className="players-list__item">{p.nickname}</li>
        ))}
      </ul>
      <div className="stack mt-3" style={{ maxWidth: 320 }}>
        <Button onClick={handleStart} disabled={players.length === 0 || starting}>
          {starting ? "Starting..." : "Start Game"}
        </Button>
        <Button variant="secondary" onClick={() => navigate("/quizzes")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
