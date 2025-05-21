import React, { useState, useEffect, useRef } from "react";

const TOTAL_QUESTIONS = 180;
const TIME_LIMIT = 3 * 60 * 60; // 3 hours in seconds

// Generate questions with proper subject distribution
const generateQuestions = () => {
  const questions = [];
  
  // Physics questions (1-45)
  for (let i = 1; i <= 45; i++) {
    questions.push({
      id: i,
      subject: "Physics",
      question: i === 1 ? "Sample Physics Question 1" : "",
      options: i === 1 ? ["Option A", "Option B", "Option C", "Option D"] : ["", "", "", ""]
    });
  }
  
  // Chemistry questions (46-90)
  for (let i = 46; i <= 90; i++) {
    questions.push({
      id: i,
      subject: "Chemistry",
      question: i === 46 ? "Sample Chemistry Question 1" : "",
      options: i === 46 ? ["Option A", "Option B", "Option C", "Option D"] : ["", "", "", ""]
    });
  }
  
  // Biology questions (91-180)
  for (let i = 91; i <= 180; i++) {
    questions.push({
      id: i,
      subject: "Biology",
      question: i === 91 ? "Sample Biology Question 1" : "",
      options: i === 91 ? ["Option A", "Option B", "Option C", "Option D"] : ["", "", "", ""]
    });
  }
  
  // Add your actual questions here by replacing the empty ones
  // For example:
  questions[47] = { // Question 48 (array index 47 since we start from 1)
    id: 48,
    subject: "Biology",
    question: "Which one of the following is a non-reducing carbohydrate?",
    options: ["Sucrose", "Maltose", "Lactose", "Isomatose"],
    correctAnswer: "Sucrose"
  };
  
  return questions;
};

const ALL_QUESTIONS = generateQuestions();

const STORAGE_KEY = "neet_test_state_v3";

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
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [activeSubject, setActiveSubject] = useState("Physics");
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
      const endTime = Date.now() + TIME_LIMIT * 1000;
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

  // Update active subject when current question changes
  useEffect(() => {
    if (ALL_QUESTIONS[currentIndex]?.subject) {
      setActiveSubject(ALL_QUESTIONS[currentIndex].subject);
    }
  }, [currentIndex]);

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

  function filterBySubject(subject) {
    const index = ALL_QUESTIONS.findIndex(q => q.subject === subject);
    if (index >= 0) setCurrentIndex(index);
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
      window.location.reload();
    }
  }

  const currentQuestion = ALL_QUESTIONS[currentIndex];
  const status = (qid) => {
    if (answers[qid]) return "Answered";
    else if (marked[qid]) return "Marked";
    else return "Not Answered";
  };

  // Count questions by subject
  const subjectCounts = {
    Physics: 45,
    Chemistry: 45,
    Biology: 90
  };

  return (
    <div style={{ 
      maxWidth: 1000, 
      margin: "auto", 
      fontFamily: "Arial, sans-serif",
      padding: 20,
      backgroundColor: "#f5f5f5"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: 8,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: 20
      }}>
        <h1 style={{ 
          color: "#333",
          borderBottom: "1px solid #eee",
          paddingBottom: 10,
          marginBottom: 20
        }}>NEET Mock Test</h1>
        
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}>
          <div style={{ fontSize: 18 }}>
            <strong>{currentIndex + 1} of {TOTAL_QUESTIONS}</strong>
          </div>
          <div style={{ 
            fontSize: 18,
            backgroundColor: "#e3f2fd",
            padding: "5px 15px",
            borderRadius: 20
          }}>
            <strong>{activeSubject}</strong>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: "#f9f9f9",
          padding: 20,
          borderRadius: 5,
          marginBottom: 20
        }}>
          <h3 style={{ marginBottom: 15 }}>{currentQuestion.question || "No question text available"}</h3>
          
          <div style={{ marginLeft: 10 }}>
            {currentQuestion.options.map((opt, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="radio"
                    name={`q${currentQuestion.id}`}
                    checked={answers[currentQuestion.id] === opt}
                    onChange={() => handleAnswer(currentQuestion.id, opt)}
                    disabled={!currentQuestion.question}
                    style={{ marginRight: 10 }}
                  />
                  <span>{opt || <i>Option not available</i>}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 30
        }}>
          <div>
            <button
              onClick={() => toggleMark(currentQuestion.id)}
              style={{
                padding: "8px 15px",
                backgroundColor: marked[currentQuestion.id] ? "#ff9800" : "#e0e0e0",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                marginRight: 10
              }}
            >
              {marked[currentQuestion.id] ? "Unmark Review" : "Mark for Review"}
            </button>
            <button
              onClick={() => {
                setAnswers(prev => {
                  const newAnswers = {...prev};
                  delete newAnswers[currentQuestion.id];
                  return newAnswers;
                });
              }}
              style={{
                padding: "8px 15px",
                backgroundColor: "#e0e0e0",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Clear Response
            </button>
          </div>
          
          <div>
            <button
              onClick={() => goToQuestion(currentIndex - 1)}
              disabled={currentIndex === 0}
              style={{
                padding: "8px 15px",
                marginRight: 10,
                backgroundColor: "#e0e0e0",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Previous
            </button>
            <button
              onClick={() => goToQuestion(currentIndex + 1)}
              disabled={currentIndex === ALL_QUESTIONS.length - 1}
              style={{
                padding: "8px 15px",
                backgroundColor: "#e0e0e0",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Next
            </button>
          </div>
        </div>
        
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #eee",
          paddingTop: 20
        }}>
          <button 
            onClick={submitTest}
            style={{
              padding: "8px 15px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            Submit Test
          </button>
          
          <div style={{ fontSize: 16 }}>
            <strong>Time Left: {formatTime(timeLeft)}</strong>
          </div>
        </div>
      </div>
      
      {/* Question Palette */}
      <div style={{
        backgroundColor: "white",
        borderRadius: 8,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: 20,
        marginTop: 20
      }}>
        <h3 style={{ marginBottom: 15 }}>Question Palette</h3>
        
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 15
        }}>
          {Object.entries(subjectCounts).map(([subject, count]) => (
            <button
              key={subject}
              onClick={() => filterBySubject(subject)}
              style={{
                padding: "5px 10px",
                backgroundColor: activeSubject === subject ? "#1976d2" : "#e0e0e0",
                color: activeSubject === subject ? "white" : "black",
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                flex: 1,
                margin: "0 5px"
              }}
            >
              {subject} ({count})
            </button>
          ))}
        </div>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 1fr)",
          gap: 5,
          marginBottom: 20,
          maxHeight: 300,
          overflowY: "auto"
        }}>
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
              title={`Q${i + 1} - ${status(q.id)} (${q.subject})`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        
        <div style={{
          display: "flex",
          gap: 15,
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 15,
              height: 15,
              backgroundColor: "#e0e0e0",
              marginRight: 5
            }}></div>
            <span>Not Answered</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 15,
              height: 15,
              backgroundColor: "#4caf50",
              marginRight: 5
            }}></div>
            <span>Answered</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 15,
              height: 15,
              backgroundColor: "#ff9800",
              marginRight: 5
            }}></div>
            <span>Marked for Review</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 15,
              height: 15,
              backgroundColor: "#1976d2",
              marginRight: 5
            }}></div>
            <span>Current Question</span>
          </div>
        </div>
      </div>
    </div>
  );
}
