import React, { useState, useEffect, useRef } from "react";

const TOTAL_QUESTIONS = 180;
const DUMMY_QUESTIONS = [
  {
    id: "q1",
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
  },
  {
    id: "q2",
    question: "What is H2O commonly known as?",
    options: ["Salt", "Water", "Oxygen", "Hydrogen"],
  },
  {
    id: "q3",
    question: "What force keeps us on the ground?",
    options: ["Magnetism", "Gravity", "Friction", "Electricity"],
  },
  {
    id: "q4",
    question: "pH of pure water is?",
    options: ["7", "1", "14", "0"],
  },
  {
    id: "q5",
    question: "Speed of light is approximately?",
    options: [
      "3 x 10^8 m/s",
      "3 x 10^6 m/s",
      "1.5 x 10^8 m/s",
      "3 x 10^9 m/s",
    ],
  },
];

// Generate empty questions to fill remaining
const EMPTY_QUESTIONS = Array.from(
  { length: TOTAL_QUESTIONS - DUMMY_QUESTIONS.length },
  (_, i) => ({
    id: `q${i + 6}`,
    question: "",
    options: ["", "", "", ""],
  })
);

const ALL_QUESTIONS = [...DUMMY_QUESTIONS, ...EMPTY_QUESTIONS];

const STORAGE_KEY = "neet_test_state_v1";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function App() {
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds
  const timerRef = useRef(null);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { answers, marked, currentIndex, endTime } = JSON.parse(saved);
      setAnswers(answers || {});
      setMarked(marked || {});
      setCurrentIndex(currentIndex || 0);

      const remaining = Math.floor((endTime - Date.now()) / 1000);
      if (remaining > 0) {
        setTimeLeft(remaining);
      } else {
        setTimeLeft(0);
      }
    } else {
      // Save initial end time
      const endTime = Date.now() + 3 * 60 * 60 * 1000;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers: {}, marked: {}, currentIndex: 0, endTime })
      );
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      clearInterval(timerRef.current);
      alert("Time is up! Please submit your test.");
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          alert("Time is up! Please submit your test.");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  // Save state on any change
  useEffect(() => {
    const endTime = Date.now() + timeLeft * 1000;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ answers, marked, currentIndex, endTime })
    );
  }, [answers, marked, currentIndex, timeLeft]);

  function handleAnswer(qid, option) {
    setAnswers((prev) => ({ ...prev, [qid]: option }));
  }

  function toggleMark(qid) {
    setMarked((prev) => {
      const newMarked = { ...prev };
      if (newMarked[qid]) delete newMarked[qid];
      else newMarked[qid] = true;
      return newMarked;
    });
  }

  function goToQuestion(i) {
    if (i >= 0 && i < ALL_QUESTIONS.length) setCurrentIndex(i);
  }

  function submitTest() {
    let answeredCount = Object.keys(answers).length;
    let markedCount = Object.keys(marked).length;
    if (
      window.confirm(
        `You have answered ${answeredCount} questions and marked ${markedCount} for review.\nSubmit test?`
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      alert("Test submitted. Thank you!");
      // Add your submit logic here (API call or backend)
      window.location.reload();
    }
  }

  const currentQuestion = ALL_QUESTIONS[currentIndex];
  const status = (qid) => {
    if (answers[qid]) return "Answered";
    else if (marked[qid]) return "Marked";
    else return "Not Answered";
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h2>NEET 2025 Test Interface</h2>
      <div
        style={{
          display: "flex",
          marginBottom: 10,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          Time Left: <b>{formatTime(timeLeft)}</b>
        </div>
        <button onClick={submitTest} style={{ padding: "5px 15px" }}>
          Submit Test
        </button>
      </div>

      <div style={{ display: "flex" }}>
        {/* Question panel */}
        <div
          style={{
            width: "25%",
            borderRight: "1px solid #ccc",
            height: 500,
            overflowY: "auto",
            paddingRight: 10,
          }}
        >
          <h3>Questions Panel</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 5,
            }}
          >
            {ALL_QUESTIONS.map((q, i) => (
              <button
                key={q.id}
                onClick={() => goToQuestion(i)}
                style={{
                  padding: 8,
                  fontSize: 12,
                  cursor: "pointer",
                  background:
                    i === currentIndex
                      ? "#1976d2"
                      : answers[q.id]
                      ? "#4caf50"
                      : marked[q.id]
                      ? "#ff9800"
                      : "#e0e0e0",
                  color: i === currentIndex ? "white" : "black",
                  border: "none",
                  borderRadius: 3,
                }}
                title={status(q.id)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question display */}
        <div style={{ width: "75%", paddingLeft: 20 }}>
          <h3>
            Question {currentIndex + 1}{" "}
            {currentQuestion.question ? "" : "(No question text)"}
          </h3>
          <p style={{ minHeight: 80, fontSize: 16 }}>
            {currentQuestion.question || <i>No question provided.</i>}
          </p>

          <div>
            {currentQuestion.options.map((opt, i) => (
              <label key={i} style={{ display: "block", marginBottom: 8 }}>
                <input
                  type="radio"
                  name={currentQuestion.id}
                  checked={answers[currentQuestion.id] === opt}
                  onChange={() => handleAnswer(currentQuestion.id, opt)}
                  disabled={!currentQuestion.question}
                />{" "}
                {opt || <i>Option not available</i>}
              </label>
            ))}
          </div>

          <button
            onClick={() => toggleMark(currentQuestion.id)}
            style={{
              marginTop: 10,
              backgroundColor: marked[currentQuestion.id] ? "#ff9800" : "#ccc",
              color: "black",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            {marked[currentQuestion.id] ? "Unmark Review" : "Mark for Review"}
          </button>

          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => goToQuestion(currentIndex - 1)}
              disabled={currentIndex === 0}
              style={{ marginRight: 10, padding: "5px 15px" }}
            >
              Previous
            </button>
            <button
              onClick={() => goToQuestion(currentIndex + 1)}
              disabled={currentIndex === ALL_QUESTIONS.length - 1}
              style={{ padding: "5px 15px" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
