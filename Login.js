import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [roll, setRoll] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (roll.trim()) {
      localStorage.setItem('roll', roll);
      navigate('/test');
    }
  };

  return (
    <div>
      <h2>NEET Test Login</h2>
      <input type="text" placeholder="Enter Roll Number" value={roll} onChange={(e) => setRoll(e.target.value)} />
      <button onClick={handleLogin}>Start Test</button>
    </div>
  );
}

export default Login;
