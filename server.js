const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Create database (safe for Render)
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("DB Error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Initialize DB
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS transaction_logs (
      id INTEGER,
      timestamp TEXT,
      ip_address TEXT,
      action TEXT,
      severity TEXT
    )
  `);

  db.run(`DELETE FROM transaction_logs`); // reset data

  db.run(`
    INSERT INTO transaction_logs VALUES
    (1, '02:14:05', '192.168.0.12', 'UNAUTHORIZED_ACCESS', 'HIGH'),
    (2, '02:14:11', '192.168.0.12', 'BUFFER_OVERFLOW', 'CRITICAL'),
    (3, '02:14:59', '192.168.0.01', 'HEARTBEAT_REPLY', 'LOW'),
    (4, '02:15:02', '192.168.0.12', 'ENCRYPTION_BYPASS', 'CRITICAL'),
    (5, '01:55:10', '192.168.0.55', 'LOGIN_SUCCESS', 'LOW')
  `);
});

// API
app.post("/query", (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(400).json({ error: err.message });
    }
    res.json({ rows });
  });
});

// Health check
app.get("/", (req, res) => {
  res.send("SQL Dossier Backend Running 🚀");
});

// PORT FIX (CRITICAL)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
