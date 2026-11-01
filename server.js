const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'transactions.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Bypass ngrok browser warning page for all visitors
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// Helper: Read transactions from JSON file
function getTransactions() {
  if (!fs.existsSync(DATA_FILE)) {
    // Initial sample seed data
    const initialData = [
      { id: 1, title: 'Salary', amount: 3500, type: 'income', category: 'Salary', date: '2026-11-01' },
      { id: 2, title: 'House Rent', amount: 1200, type: 'expense', category: 'Housing', date: '2026-11-01' },
      { id: 3, title: 'Groceries', amount: 150, type: 'expense', category: 'Food', date: '2026-11-01' },
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    return [];
  }
}

// Helper: Save transactions to JSON file
function saveTransactions(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 1. GET /api/transactions - Retrieve all transactions
app.get('/api/transactions', (req, res) => {
  const transactions = getTransactions();
  res.json(transactions);
});

// 2. POST /api/transactions - Create a new transaction
app.post('/api/transactions', (req, res) => {
  const { title, amount, type, category, date } = req.body;

  if (!title || !amount || !type || !category) {
    return res.status(400).json({ error: 'Please provide title, amount, type, and category.' });
  }

  const transactions = getTransactions();
  const newTransaction = {
    id: Date.now(),
    title: title.trim(),
    amount: parseFloat(amount),
    type, // 'income' or 'expense'
    category,
    date: date || new Date().toISOString().split('T')[0]
  };

  transactions.unshift(newTransaction); // Add to top
  saveTransactions(transactions);

  res.status(201).json(newTransaction);
});

// 3. DELETE /api/transactions/:id - Delete a transaction
app.delete('/api/transactions/:id', (req, res) => {
  const id = Number(req.params.id);
  let transactions = getTransactions();
  const exists = transactions.some(t => t.id === id);

  if (!exists) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  transactions = transactions.filter(t => t.id !== id);
  saveTransactions(transactions);

  res.json({ message: 'Transaction deleted successfully', id });
});

// 4. DELETE /api/transactions - Reset ALL transactions
app.delete('/api/transactions', (req, res) => {
  saveTransactions([]);
  res.json({ message: 'All transactions cleared' });
});

// Start server
app.listen(PORT, () => {
  getTransactions(); // Ensure seed file exists
  console.log(`Budget Tracker server running at: http://localhost:${PORT}`);
});
