import React, { useEffect, useState } from 'react';

const sampleQuestions = [
  {
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Chloroplast'],
    correct: 1,
  },
  {
    question: 'What is H2O?',
    options: ['Oxygen', 'Hydrogen', 'Water', 'Carbon Dioxide'],
    correct: 2,
  }
];

function TestPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(sampleQuestions.length).fill(null));

  const handleSelect = (idx) => {
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
  };

  return (
    <div>
      <h3>Question {current + 1}</h3>
      <p>{sampleQuestions[current].question}</p>
      {sampleQuestions[current].options.map((opt, idx) => (
        <div key={idx}>
          <input
            type="radio"
            checked={answers[current] === idx}
            onChange={() => handleSelect(idx)}
          />
          {opt}
        </div>
      ))}
      <br />
      <button onClick={() => setCurrent(current - 1)} disabled={current === 0}>Prev</button>
      <button onClick={() => setCurrent(current + 1)} disabled={current === sampleQuestions.length - 1}>Next</button>
    </div>
  );
}

export default TestPage;
