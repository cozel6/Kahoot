import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "@/services/api";
import type { AnswerOptionIn, QuestionIn, QuizCreate } from "@/types/quiz";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const makeOption = (): AnswerOptionIn => ({ text: "", is_correct: false });
const makeQuestion = (): QuestionIn => ({
  text: "",
  type: "multiple_choice",
  time_limit_ms: 20000,
  options: [makeOption(), makeOption(), makeOption(), makeOption()],
});

export function QuizEditPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionIn[]>([makeQuestion()]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateQuestion(qi: number, patch: Partial<QuestionIn>) {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  }

  function updateOption(qi: number, oi: number, patch: Partial<AnswerOptionIn>) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qi ? q : { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) },
      ),
    );
  }

  function setCorrect(qi: number, oi: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qi ? q : { ...q, options: q.options.map((o, j) => ({ ...o, is_correct: j === oi })) },
      ),
    );
  }

  function changeType(qi: number, type: QuestionIn["type"]) {
    const options =
      type === "true_false"
        ? [
            { text: "True", is_correct: true },
            { text: "False", is_correct: false },
          ]
        : [makeOption(), makeOption(), makeOption(), makeOption()];
    updateQuestion(qi, { type, options });
  }

  async function handleSave() {
    setError(null);
    if (!title.trim()) { setError("Quiz title is required."); return; }
    const payload: QuizCreate = { title: title.trim(), questions };
    setSaving(true);
    try {
      await api.createQuiz(payload);
      navigate("/quizzes");
    } catch (e) {
      setError(e instanceof ApiError ? `Error ${e.status}: ${e.message}` : String(e));
    } finally {
      setSaving(false);
    }
  }

  const labelStyle = { color: "rgba(255,255,255,0.7)" };

  return (
    <div className="page page--top">
      <div className="quiz-editor">
        <h1 className="title">New Quiz</h1>
        {error && <p className="error-text mb-2">{error}</p>}

        <Input
          label="Quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My awesome quiz"
        />

        {questions.map((q, qi) => (
          <div key={qi} className="question-block">
            <div className="question-block__header">
              <strong style={{ color: "white" }}>Question {qi + 1}</strong>
              {questions.length > 1 && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))}
                >
                  Remove
                </Button>
              )}
            </div>

            <Input
              label="Question text"
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              placeholder="What is...?"
            />

            <div className="input-group">
              <label className="input-label" style={labelStyle}>Time limit</label>
              <select
                className="input"
                value={q.time_limit_ms}
                onChange={(e) => updateQuestion(qi, { time_limit_ms: Number(e.target.value) })}
              >
                <option value={10000}>10 seconds</option>
                <option value={20000}>20 seconds</option>
                <option value={30000}>30 seconds</option>
                <option value={60000}>60 seconds</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label" style={labelStyle}>Type</label>
              <select
                className="input"
                value={q.type}
                onChange={(e) => changeType(qi, e.target.value as QuestionIn["type"])}
              >
                <option value="multiple_choice">Multiple choice</option>
                <option value="true_false">True / False</option>
              </select>
            </div>

            <p className="input-label" style={{ ...labelStyle, marginBottom: "0.5rem" }}>
              Options (select the correct one)
            </p>
            {q.options.map((o, oi) => (
              <div key={oi} className="option-row">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={o.is_correct}
                  onChange={() => setCorrect(qi, oi)}
                  style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }}
                />
                <input
                  className="input"
                  style={{ marginBottom: 0 }}
                  value={o.text}
                  placeholder={`Option ${oi + 1}`}
                  disabled={q.type === "true_false"}
                  onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                />
              </div>
            ))}
          </div>
        ))}

        <div className="stack">
          <Button variant="secondary" onClick={() => setQuestions((prev) => [...prev, makeQuestion()])}>
            + Add Question
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Quiz"}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/quizzes")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
