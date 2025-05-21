import React, { useState, useEffect } from "react";
import "./App.css";

const questions = [
  {
    id: 1,
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
  },
  {
    id: 2,
    question: "What is the chemical formula of water?",
    options: ["H2O", "CO2", "NaCl", "O2"],
  },
  {
    id: 3,
    question: "What force keeps planets in orbit?",
    options: ["Magnetism", "Friction", "Gravity", "Electricity"],
  },
  {
    id: 4,
    question: "What is the boiling point of water?",
    options: ["100°C", "0°C", "50°C", "90°C"],
  },
  {
    id: 5,
    question: "Which vitamin is produced when skin is exposed to sunlight?",
    options: ["Vitamin A", "Vitamin B12", "Vitamin D", "Vitamin C"],
  },
  // Add more questions here (up to 180 for your test)
];

export default function App() {
  const totalQuestions = questions.length;

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // {questionId: optionIndex}
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function selectOption(qId, optionIndex) {
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  }

  function toggleMarkReview(qId) {
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(qId)) {
        newSet.delete(qId);
      } else {
        newSet.add(qId);
      }
      return newSet;
    });
  }

  function questionStatus(qId) {
    if (markedForReview.has(qId)) return "marked";
    if (answers[qId] !== undefined) return "answered";
    return "not-answered";
  }

  return (
    <>
      <h1>NEET Test Interface</h1>
      <div className="app-container">
        <div className="sidebar">
          <h3>Questions</h3>
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`question-status ${questionStatus(q.id)}`}
              onClick={() => setCurrentQ(i)}
            >
              {q.id} - {questionStatus(q.id).replace("-", " ")}
            </div>
          ))}
        </div>

        <div className="main-panel">
          <div>
            <div className="question-text">
              Q{questions[currentQ].id}: {questions[currentQ].question}
            </div>

            <div className="options">
              {questions[currentQ].options.map((opt, idx) => (
                <label key={idx} className="option-label">
                  <input
                    type="radio"
                    name={`question-${questions[currentQ].id}`}
                    className="option-input"
                    checked={answers[questions[currentQ].id] === idx}
                    onChange={() =>
                      selectOption(questions[currentQ].id, idx)
                    }
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="controls">
            <button
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((q) => q - 1)}
            >
              Previous
            </button>

            <button
              className="mark-review"
              onClick={() => toggleMarkReview(questions[currentQ].id)}
            >
              {markedForReview.has(questions[currentQ].id)
                ? "Unmark Review"
                : "Mark for Review"}
            </button>

            <button
              disabled={currentQ === totalQuestions - 1}
              onClick={() => setCurrentQ((q) => q + 1)}
            >
              Next
            </button>
          </div>

          <div className="timer">Time Left: {formatTime(timeLeft)}</div>
        </div>
      </div>
    </>
  );
}
