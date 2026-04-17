from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    """Tracks WebSocket connections grouped by room code."""

    def __init__(self) -> None:
        self._rooms: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, code: str, ws: WebSocket) -> None:
        await ws.accept()
        self._rooms[code].append(ws)

    def disconnect(self, code: str, ws: WebSocket) -> None:
        if ws in self._rooms.get(code, []):
            self._rooms[code].remove(ws)
        if not self._rooms.get(code):
            self._rooms.pop(code, None)

    async def send_to(self, ws: WebSocket, payload: dict) -> None:
        await ws.send_json(payload)

    async def broadcast(self, code: str, payload: dict) -> None:
        """Sends to all clients in the room. Removes dead connections."""
        dead: list[WebSocket] = []
        for ws in list(self._rooms.get(code, [])):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(code, ws)


manager = ConnectionManager()