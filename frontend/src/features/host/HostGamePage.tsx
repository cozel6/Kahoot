import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GameSocket } from "@/services/socket";
import { useGameStore } from "@/store/gameStore";
import type { ServerWsMessage } from "@/types/ws-messages";
import { QuestionCard } from "@/components/game/QuestionCard";
import { Timer } from "@/components/game/Timer";
import { Leaderboard } from "@/components/game/Leaderboard";
import { Button } from "@/components/ui/Button";

export function HostGamePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const socketRef = useRef<GameSocket | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const [timeExpired, setTimeExpired] = useState(false);

  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const questionResult = useGameStore((s) => s.questionResult);
  const setQuestion = useGameStore((s) => s.setQuestion);
  const setQuestionResult = useGameStore((s) => s.setQuestionResult);
  const setFinalLeaderboard = useGameStore((s) => s.setFinalLeaderboard);

  useEffect(() => {
    if (!code) return;
    const socket = new GameSocket(code, "host");
    socketRef.current = socket;

    socket.onMessage((msg: ServerWsMessage) => {
      if (msg.type === "question") {
        setQuestion(msg);
        setTimerKey((k) => k + 1);
        setTimeExpired(false);
      } else if (msg.type === "question_end") {
        setQuestionResult(msg);
        setTimeExpired(true);
      } else if (msg.type === "game_end") {
        setFinalLeaderboard(msg.final_leaderboard);
        navigate(`/host/results/${code}`);
      }
    });

    return () => socket.close();
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimerExpire = useCallback(() => setTimeExpired(true), []);

  if (!currentQuestion) {
    return <div className="page"><p className="waiting-text">Loading question...</p></div>;
  }

  return (
    <div className="page">
      <QuestionCard question={currentQuestion} />

      {!timeExpired && (
        <div style={{ width: "100%", maxWidth: 640, padding: "0 1rem" }}>
          <Timer key={timerKey} durationMs={currentQuestion.time_limit_ms} onExpire={handleTimerExpire} />
        </div>
      )}

      {questionResult && (
        <div className="mt-2 text-center">
          <p className="subtitle">Correct answer: Option {questionResult.correct_idx + 1}</p>
          <Leaderboard players={questionResult.leaderboard} />
        </div>
      )}

      {timeExpired && (
        <Button className="mt-3" onClick={() => socketRef.current?.send({ type: "host_next" })}>
          Next Question
        </Button>
      )}
    </div>
  );
}
