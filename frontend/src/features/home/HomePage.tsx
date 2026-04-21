import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <h1 className="title">Kahoot Clone</h1>
      <p className="subtitle">Real-time quiz game</p>
      <div className="stack" style={{ maxWidth: 320 }}>
        <Button onClick={() => navigate("/quizzes")}>I'm a Host</Button>
        <Button variant="secondary" onClick={() => navigate("/join")}>
          Join a Game
        </Button>
      </div>
    </div>
  );
}
