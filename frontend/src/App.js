import React, { useState, useEffect } from 'react';

const totalQuestions = 180;
const TEST_DURATION = 3 * 60 * 60; // 3 hours in seconds

function App() {
  // State for login and test
  const [rollNumber, setRollNumber] = useState(() => localStorage.getItem('rollNumber') || '');
  const [loggedIn, setLoggedIn] = useState(!!rollNumber);
  const [startTime, setStartTime] = useState(() => {
    const saved = localStorage.getItem('startTime');
    return saved ? Number(saved) : null;
  });

  // Timer
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!startTime) return TEST_DURATION;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return elapsed >= TEST_DURATION ? 0 : TEST_DURATION - elapsed;
  });

  // Question state
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState(Array(totalQuestions).fill(null));
  const [markedForReview, setMarkedForReview] = useState([]);

  // Timer countdown
  useEffect(() => {
    if (!loggedIn || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loggedIn, timeLeft]);

  // Handle login submit
  const handleLogin = (e) => {
    e.preventDefault();
    if (rollNumber.trim() === '') {
      alert('Please enter your roll number');
      return;
    }
    // Save login info and start time
    localStorage.setItem('rollNumber', rollNumber);
    const now = Date.now();
    localStorage.setItem('startTime', now.toString());
    setStartTime(now);
    setTimeLeft(TEST_DURATION);
    setLoggedIn(true);
  };

  // Format time mm:ss
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswer = (option) => {
    if (timeLeft === 0) return; // no answers after time up
    const newAnswers = [...answers];
    newAnswers[currentQuestion - 1] = option;
    setAnswers(newAnswers);
  };

  // Toggle mark for review
  const toggleMark = (qNum) => {
    if (markedForReview.includes(qNum)) {
      setMarkedForReview(markedForReview.filter((q) => q !== qNum));
    } else {
      setMarkedForReview([...markedForReview, qNum]);
    }
  };

  // Dummy questions placeholder
  const questionText = `Question ${currentQuestion}: Sample question text here?`;
  const options = ['A', 'B', 'C', 'D'];

  if (!loggedIn) {
    // Login page
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>NEET Test Login</h1>
        <form onSubmit={handleLogin}>
          <label>
            Enter Roll Number:
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </label>
          <button type="submit" style={{ marginLeft: '10px' }}>
            Start Test
          </button>
        </form>
      </div>
    );
  }

  if (timeLeft === 0) {
    // Time up screen
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Time's Up!</h1>
        <p>Your 3-hour test time has ended.</p>
        <p>Thank you for participating.</p>
      </div>
    );
  }

  // Test interface
  return (
    <div style={{ display: 'flex', fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '150px', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h3>Questions</h3>
        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {Array.from({ length: totalQuestions }, (_, i) => {
            const qNum = i + 1;
            const status =
              answers[i] !== null
                ? 'Answered'
                : markedForReview.includes(qNum)
                ? 'Marked'
                : 'Not Answered';
            const color =
              status === 'Answered' ? 'green' : status === 'Marked' ? 'orange' : 'red';

            return (
              <div
                key={qNum}
                onClick={() => setCurrentQuestion(qNum)}
                style={{
                  cursor: 'pointer',
                  marginBottom: '5px',
                  color,
                  fontWeight: currentQuestion === qNum ? 'bold' : 'normal',
                }}
              >
                {qNum} - {status}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => toggleMark(currentQuestion)}>
            {markedForReview.includes(currentQuestion) ? 'Unmark' : 'Mark for Review'}
          </button>
        </div>
        <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
          Time Left: {formatTime(timeLeft)}
        </div>
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => {
              localStorage.removeItem('rollNumber');
              localStorage.removeItem('startTime');
              setLoggedIn(false);
              setRollNumber('');
              setStartTime(null);
              setTimeLeft(TEST_DURATION);
              setAnswers(Array(totalQuestions).fill(null));
              setMarkedForReview([]);
              setCurrentQuestion(1);
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Question Panel */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h2>{questionText}</h2>
        <div>
          {options.map((opt) => (
            <div key={opt} style={{ margin: '10px 0' }}>
              <label>
                <input
                  type="radio"
                  name="option"
                  checked={answers[currentQuestion - 1] === opt}
                  onChange={() => handleAnswer(opt)}
                  disabled={timeLeft === 0}
                />{' '}
                {opt}
              </label>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => setCurrentQuestion((q) => Math.max(1, q - 1))}
            disabled={currentQuestion === 1}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentQuestion((q) => Math.min(totalQuestions, q + 1))}
            disabled={currentQuestion === totalQuestions}
            style={{ marginLeft: '10px' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
