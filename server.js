const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Bypass ngrok browser warning page for all visitors
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// ── In-memory store with seed data ──────────────────────────
// NOTE: On Vercel (serverless), each function call may be a
// fresh instance. All real persistence is handled by
// localStorage in the browser (see public/app.js).
// This backend only acts as a lightweight API passthrough.
let transactions = [];

// GET /api/transactions
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// POST /api/transactions
app.post('/api/transactions', (req, res) => {
  const { title, amount, type, category, date } = req.body;

  if (!title || !amount || !type || !category) {
    return res.status(400).json({ error: 'Please provide title, amount, type, and category.' });
  }

  const newTransaction = {
    id: Date.now(),
    title: title.trim(),
    amount: parseFloat(amount),
    type,
    category,
    date: date || new Date().toISOString().split('T')[0]
  };

  transactions.unshift(newTransaction);
  res.status(201).json(newTransaction);
});

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', (req, res) => {
  const id = Number(req.params.id);
  const exists = transactions.some(t => t.id === id);
  if (!exists) return res.status(404).json({ error: 'Transaction not found' });
  transactions = transactions.filter(t => t.id !== id);
  res.json({ message: 'Deleted', id });
});

// DELETE /api/transactions — reset all
app.delete('/api/transactions', (req, res) => {
  transactions = [];
  res.json({ message: 'All transactions cleared' });
});

// Start server (local dev only — Vercel uses the exported app)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Budget Tracker running at: http://localhost:${PORT}`);
  });
}

module.exports = app;
