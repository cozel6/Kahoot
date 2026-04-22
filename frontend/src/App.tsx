import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "@/features/home/HomePage";
import { QuizListPage } from "@/features/quiz-editor/QuizListPage";
import { QuizEditPage } from "@/features/quiz-editor/QuizEditPage";
import { HostLobbyPage } from "@/features/host/HostLobbyPage";
import { HostGamePage } from "@/features/host/HostGamePage";
import { HostResultsPage } from "@/features/host/HostResultsPage";
import { JoinRoomPage } from "@/features/player/JoinRoomPage";
import { PlayerLobbyPage } from "@/features/player/PlayerLobbyPage";
import { PlayerGamePage } from "@/features/player/PlayerGamePage";
import { PlayerResultsPage } from "@/features/player/PlayerResultsPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quizzes" element={<QuizListPage />} />
        <Route path="/quizzes/new" element={<QuizEditPage />} />
        <Route path="/host/lobby/:code" element={<HostLobbyPage />} />
        <Route path="/host/game/:code" element={<HostGamePage />} />
        <Route path="/host/results/:code" element={<HostResultsPage />} />
        <Route path="/join" element={<JoinRoomPage />} />
        <Route path="/player/lobby/:code" element={<PlayerLobbyPage />} />
        <Route path="/player/game/:code" element={<PlayerGamePage />} />
        <Route path="/player/results/:code" element={<PlayerResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
