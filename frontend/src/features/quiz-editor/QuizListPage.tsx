import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useToastStore } from "@/store/toastStore";
import type { QuizSummary } from "@/types/quiz";
import { Button } from "@/components/ui/Button";

export function QuizListPage() {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<number | null>(null);

  useEffect(() => {
    api
      .listQuizzes()
      .then(setQuizzes)
      .catch((e: unknown) => addToast(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function handleStart(quizId: number) {
    setCreating(quizId);
    try {
      const room = await api.createRoom(quizId);
      navigate(`/host/lobby/${room.code}`);
    } catch (e) {
      addToast(String(e));
      setCreating(null);
    }
  }

  async function handleDelete(quizId: number) {
    if (!confirm("Delete this quiz?")) return;
    try {
      await api.deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (e) {
      addToast(String(e));
    }
  }

  if (loading) return <div className="page"><p>Loading quizzes...</p></div>;

  return (
    <div className="page page--top">
      <h1 className="title">My Quizzes</h1>
      {quizzes.length === 0 ? (
        <p className="subtitle">No quizzes yet. Create one below.</p>
      ) : (
        <ul className="quiz-list">
          {quizzes.map((q) => (
            <li key={q.id} className="quiz-list__item">
              <span className="quiz-list__title">{q.title}</span>
              <div className="quiz-list__actions">
                <Button
                  size="sm"
                  variant="success"
                  disabled={creating === q.id}
                  onClick={() => handleStart(q.id)}
                >
                  {creating === q.id ? "..." : "Start"}
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(q.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="stack mt-2" style={{ maxWidth: 480, width: "100%" }}>
        <Button onClick={() => navigate("/quizzes/new")}>+ New Quiz</Button>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back
        </Button>
      </div>
    </div>
  );
}
