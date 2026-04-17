from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.ws.connection_manager import manager
from app.db.base import AsyncSessionLocal
from app.db.models import QuestionModel
from app.schemas.room import PlayerOut
from app.api.ws.ws_messages import (
    AnswerAckMsg,
    ErrorMsg,
    GameEndMsg,
    PlayerJoinedMsg,
    QuestionEndMsg,
    QuestionMsg,
    QuestionOptionView,
)
from app.services.game_service import GameService, GameServiceError

router = APIRouter()


def _question_to_msg(idx: int, total: int, q: QuestionModel) -> QuestionMsg:
    return QuestionMsg(
        index=idx,
        total=total,
        text=q.text,
        options=[QuestionOptionView(text=opt.text) for opt in q.options],
        time_limit_ms=q.time_limit_ms,
    )


@router.websocket("/ws/game/{code}")
async def game_ws(
    ws: WebSocket,
    code: str,
    player_id: int | None = None,
    host: int = 0,
) -> None:
    code = code.upper()
    is_host = bool(host)

    await manager.connect(code, ws)
    try:
        # If it's a player, notify everyone else that someone new joined.
        if not is_host and player_id is not None:
            async with AsyncSessionLocal() as db:
                service = GameService(db)
                session_model = await service.sessions.get_by_code(code)
                if session_model is None:
                    await ws.send_json(ErrorMsg(message="Room does not exist.").model_dump())
                    await ws.close()
                    return
                player = next(
                    (p for p in session_model.players if p.id == player_id), None
                )
                if player is None:
                    await ws.send_json(ErrorMsg(message="Unknown player.").model_dump())
                    await ws.close()
                    return
                await manager.broadcast(
                    code,
                    PlayerJoinedMsg(player=PlayerOut.model_validate(player)).model_dump(),
                )

        # Main message loop.
        while True:
            msg = await ws.receive_json()
            await _handle_message(code, ws, is_host, player_id, msg)

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(code, ws)


async def _handle_message(
    code: str,
    ws: WebSocket,
    is_host: bool,
    player_id: int | None,
    msg: dict,
) -> None:
    msg_type = msg.get("type")

    # --- HOST: start game ---
    if is_host and msg_type == "host_start":
        async with AsyncSessionLocal() as db:
            service = GameService(db)
            try:
                session_model = await service.start_game(code)
            except GameServiceError as exc:
                await ws.send_json(ErrorMsg(message=str(exc)).model_dump())
                return
            await db.commit()
            first_q = session_model.quiz.questions[0]
            total = len(session_model.quiz.questions)
        await manager.broadcast(
            code, _question_to_msg(0, total, first_q).model_dump()
        )
        return

    # --- HOST: advance to next question ---
    if is_host and msg_type == "host_next":
        async with AsyncSessionLocal() as db:
            service = GameService(db)
            try:
                session_model = await service.sessions.get_by_code(code)
                if session_model is None:
                    raise GameServiceError("Camera nu există.")

                # 1. Broadcast "question_end" for the question that just finished.
                current = await service.current_question(session_model)
                end_payload: dict | None = None
                if current is not None:
                    correct_idx = next(
                        (i for i, o in enumerate(current.options) if o.is_correct),
                        -1,
                    )
                    leaderboard = sorted(
                        session_model.players, key=lambda p: p.score, reverse=True
                    )
                    end_payload = QuestionEndMsg(
                        correct_idx=correct_idx,
                        leaderboard=[PlayerOut.model_validate(p) for p in leaderboard],
                    ).model_dump()

                # 2. Advance (mutates the index, may transition state to FINISHED).
                next_q = await service.advance_question(code)
                await db.commit()
                total = len(session_model.quiz.questions)
                next_idx = session_model.current_question_idx
                final_leaderboard = sorted(
                    session_model.players, key=lambda p: p.score, reverse=True
                )
            except GameServiceError as exc:
                await ws.send_json(ErrorMsg(message=str(exc)).model_dump())
                return

        if end_payload is not None:
            await manager.broadcast(code, end_payload)

        if next_q is None:
            await manager.broadcast(
                code,
                GameEndMsg(
                    final_leaderboard=[PlayerOut.model_validate(p) for p in final_leaderboard],
                ).model_dump(),
            )
        else:
            await manager.broadcast(
                code, _question_to_msg(next_idx, total, next_q).model_dump()
            )
        return

    # --- PLAYER: submit answer ---
    if not is_host and msg_type == "player_answer" and player_id is not None:
        option_idx = int(msg.get("option_idx", -1))
        elapsed_ms = int(msg.get("elapsed_ms", 0))
        async with AsyncSessionLocal() as db:
            service = GameService(db)
            try:
                result = await service.submit_answer(
                    code, player_id, option_idx, elapsed_ms
                )
            except GameServiceError as exc:
                await ws.send_json(ErrorMsg(message=str(exc)).model_dump())
                return
            await db.commit()
        await ws.send_json(
            AnswerAckMsg(
                is_correct=result.is_correct,
                points_awarded=result.points_awarded,
                total_score=result.total_score,
            ).model_dump()
        )
        return

    # --- unknown message type ---
    await ws.send_json(ErrorMsg(message=f"Unknown type: {msg_type}").model_dump())