import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GameSocket } from "@/services/socket";
import { useGameStore } from "@/store/gameStore";
import { useRoomStore } from "@/store/roomStore";
import type { ServerWsMessage } from "@/types/ws-messages";
import { AnswerButton } from "@/components/game/AnswerButton";
import { Timer } from "@/components/game/Timer";

export function PlayerGamePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const socketRef = useRef<GameSocket | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [timerKey, setTimerKey] = useState(0);
  const [timeExpired, setTimeExpired] = useState(false);

  const playerId = useRoomStore((s) => s.playerId);
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const answerResult = useGameStore((s) => s.answerResult);
  const questionResult = useGameStore((s) => s.questionResult);
  const hasAnswered = useGameStore((s) => s.hasAnswered);
  const setQuestion = useGameStore((s) => s.setQuestion);
  const setAnswerResult = useGameStore((s) => s.setAnswerResult);
  const setQuestionResult = useGameStore((s) => s.setQuestionResult);
  const setFinalLeaderboard = useGameStore((s) => s.setFinalLeaderboard);

  useEffect(() => {
    if (!code || playerId === null) return;
    const socket = new GameSocket(code, "player", playerId);
    socketRef.current = socket;
    startTimeRef.current = Date.now();

    socket.onMessage((msg: ServerWsMessage) => {
      if (msg.type === "question") {
        setQuestion(msg);
        startTimeRef.current = Date.now();
        setTimerKey((k) => k + 1);
        setTimeExpired(false);
      } else if (msg.type === "answer_ack") {
        setAnswerResult(msg);
      } else if (msg.type === "question_end") {
        setQuestionResult(msg);
        setTimeExpired(true);
      } else if (msg.type === "game_end") {
        setFinalLeaderboard(msg.final_leaderboard);
        navigate(`/player/results/${code}`);
      }
    });

    return () => socket.close();
  }, [code, playerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimerExpire = useCallback(() => setTimeExpired(true), []);

  function handleAnswer(optionIdx: number) {
    if (!socketRef.current || hasAnswered || timeExpired) return;
    socketRef.current.send({
      type: "player_answer",
      option_idx: optionIdx,
      elapsed_ms: Date.now() - startTimeRef.current,
    });
  }

  function getButtonState(i: number): "idle" | "correct" | "wrong" {
    if (!questionResult) return "idle";
    return i === questionResult.correct_idx ? "correct" : "wrong";
  }

  if (!currentQuestion) {
    return <div className="page"><p className="waiting-text">Loading question...</p></div>;
  }

  return (
    <div className="page">
      <p className="question-counter">
        Question {currentQuestion.index + 1} / {currentQuestion.total}
      </p>
      <p className="question-text">{currentQuestion.text}</p>

      {!timeExpired && !hasAnswered && (
        <div style={{ width: "100%", maxWidth: 640, padding: "0 1rem" }}>
          <Timer key={timerKey} durationMs={currentQuestion.time_limit_ms} onExpire={handleTimerExpire} />
        </div>
      )}

      {answerResult && (
        <div className="text-center mt-2">
          <div className="result-icon">{answerResult.is_correct ? "✓" : "✗"}</div>
          <p className="subtitle">
            {answerResult.is_correct ? "Correct!" : "Wrong!"}{" "}
            +{answerResult.points_awarded} pts | Total: {answerResult.total_score} pts
          </p>
        </div>
      )}

      {timeExpired && !hasAnswered && <p className="subtitle mt-2">Time's up!</p>}

      <div className="answer-grid">
        {currentQuestion.options.map((opt, i) => (
          <AnswerButton
            key={i}
            index={i}
            text={opt.text}
            disabled={hasAnswered || timeExpired}
            state={getButtonState(i)}
            onClick={() => handleAnswer(i)}
          />
        ))}
      </div>
    </div>
  );
}
