const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: '198.12.240.20',
  user: 'tap', 
  password: 'ocarinhadapolo', 
  database: 'taptelegram'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.get('/api/points', (req, res) => {
  const { userId } = req.query;
  db.query('SELECT points FROM users_points WHERE userId = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    if (results.length === 0) {
      db.query('INSERT INTO users_points (userId, points) VALUES (?, 0)', [userId], (err, results) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        return res.json({ points: 0 });
      });
    } else {
      res.json({ points: results[0].points });
    }
  });
});

app.post('/api/points', (req, res) => {
  const { userId, points } = req.body;
  db.query('INSERT INTO users_points (userId, points) VALUES (?, ?) ON DUPLICATE KEY UPDATE points = ?', [userId, points, points], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json({ userId, points });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
