import type { ClientWsMessage, ServerWsMessage } from "@/types/ws-messages";

const WS_BASE = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000";

type MessageHandler = (msg: ServerWsMessage) => void;

export class GameSocket {
  private ws: WebSocket;
  private queue: ClientWsMessage[] = [];
  private handler: MessageHandler | null = null;

  constructor(code: string, role: "host" | "player", playerId?: number) {
    const params = new URLSearchParams();
    if (role === "host") {
      params.set("host", "1");
    } else if (playerId !== undefined) {
      params.set("player_id", String(playerId));
    }
    this.ws = new WebSocket(`${WS_BASE}/ws/game/${code}?${params.toString()}`);

    this.ws.onopen = () => {
      for (const msg of this.queue) this.ws.send(JSON.stringify(msg));
      this.queue = [];
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const msg = JSON.parse(event.data) as ServerWsMessage;
        this.handler?.(msg);
      } catch {
        console.error("Invalid WS message:", event.data);
      }
    };

    this.ws.onerror = (e) => console.error("WebSocket error:", e);
    this.ws.onclose = () => console.info("WebSocket closed");
  }

  onMessage(handler: MessageHandler): void {
    this.handler = handler;
  }

  send(msg: ClientWsMessage): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      this.queue.push(msg);
    }
  }

  close(): void {
    this.ws.close();
  }
}
