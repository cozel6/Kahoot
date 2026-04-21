import type { Player } from "@/types/player";

interface LeaderboardProps {
  players: Player[];
}

export function Leaderboard({ players }: LeaderboardProps) {
  return (
    <ol className="leaderboard">
      {players.map((p, i) => (
        <li key={p.id} className="leaderboard__item">
          <span className="leaderboard__rank">#{i + 1}</span>
          <span className="leaderboard__nickname">{p.nickname}</span>
          <span className="leaderboard__score">{p.score} pts</span>
        </li>
      ))}
    </ol>
  );
}
