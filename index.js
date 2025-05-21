const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let allowedRolls = ['ROLL001', 'ROLL002', 'ROLL003'];

app.post('/login', (req, res) => {
  const { roll } = req.body;
  if (allowedRolls.includes(roll)) {
    res.json({ success: true });
  } else {
    res.status(403).json({ success: false, message: 'Invalid roll number' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
