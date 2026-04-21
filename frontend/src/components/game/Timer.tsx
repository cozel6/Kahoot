import { useEffect, useState } from "react";

interface TimerProps {
  durationMs: number;
  onExpire: () => void;
}

export function Timer({ durationMs, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    setRemaining(durationMs);
    const start = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, durationMs - (Date.now() - start));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onExpire();
      }
    }, 100);
    return () => clearInterval(id);
  }, [durationMs, onExpire]);

  const pct = (remaining / durationMs) * 100;
  return (
    <div>
      <div className="timer">{Math.ceil(remaining / 1000)}</div>
      <div className="timer-bar">
        <div className="timer-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
