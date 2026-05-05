import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "@/services/api";
import { useRoomStore } from "@/store/roomStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function JoinRoomPage() {
  const navigate = useNavigate();
  const setRoom = useRoomStore((s) => s.setRoom);
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setError(null);
    if (!code.trim()) { setError("Room code is required."); return; }
    if (!nickname.trim()) { setError("Nickname is required."); return; }
    setLoading(true);
    try {
      const res = await api.joinRoom(code.trim().toUpperCase(), nickname.trim());
      setRoom(res.room.code, "player", res.player.id);
      navigate(`/player/lobby/${res.room.code}`);
    } catch (e) {
      setError(e instanceof ApiError ? `Error ${e.status}: ${e.message}` : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <Card title="Join a Game">
        {error && <p className="error-text mb-2">{error}</p>}
        <Input
          id="code"
          label="Room Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
        />
        <Input
          id="nickname"
          label="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Your name"
          maxLength={50}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        />
        <Button onClick={handleJoin} disabled={loading}>
          {loading ? "Joining..." : "Join Game"}
        </Button>
        <Button variant="secondary" className="mt-1" onClick={() => navigate("/")}>
          Back
        </Button>
      </Card>
    </div>
  );
}
