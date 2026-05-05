import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { Leaderboard } from "@/components/game/Leaderboard";
import { Button } from "@/components/ui/Button";

export function HostResultsPage() {
  const navigate = useNavigate();
  const finalLeaderboard = useGameStore((s) => s.finalLeaderboard);

  return (
    <div className="page">
      <h1 className="title">Game Over!</h1>
      <p className="subtitle">Final Leaderboard</p>
      {finalLeaderboard && finalLeaderboard.length > 0 ? (
        <Leaderboard players={finalLeaderboard} />
      ) : (
        <p className="subtitle">No players.</p>
      )}
      <Button className="mt-3" onClick={() => navigate("/quizzes")}>
        Back to Quizzes
      </Button>
    </div>
  );
}
