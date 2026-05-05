import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { useRoomStore } from "@/store/roomStore";
import { Leaderboard } from "@/components/game/Leaderboard";
import { Button } from "@/components/ui/Button";

export function PlayerResultsPage() {
  const navigate = useNavigate();
  const finalLeaderboard = useGameStore((s) => s.finalLeaderboard);
  const playerId = useRoomStore((s) => s.playerId);

  const myRank = finalLeaderboard
    ? finalLeaderboard.findIndex((p) => p.id === playerId) + 1
    : null;
  const myEntry = finalLeaderboard?.find((p) => p.id === playerId);

  const medal =
    myRank === 1 ? "🥇" : myRank === 2 ? "🥈" : myRank === 3 ? "🥉" : "🎉";

  return (
    <div className="page">
      <h1 className="title">Game Over!</h1>
      {myEntry && myRank && (
        <div className="text-center mb-2">
          <div className="result-icon">{medal}</div>
          <p className="subtitle">
            You finished #{myRank} with {myEntry.score} points
          </p>
        </div>
      )}
      {finalLeaderboard && <Leaderboard players={finalLeaderboard} />}
      <Button className="mt-3" onClick={() => navigate("/")}>
        Play Again
      </Button>
    </div>
  );
}
