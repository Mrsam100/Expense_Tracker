# 💼 Personal Budget Tracker (Full-Stack)

A clean, beginner-friendly full-stack application built with **Node.js + Express** and a modern, responsive frontend.

---

## 🚀 Features

- **Dashboard Cards:** Real-time calculation of Total Balance, Total Income, and Total Expenses.
- **Add Transactions:** Log income or expenses with a title, amount, category, and date.
- **Filter Tabs:** Quickly toggle views between **All**, **Income**, and **Expense**.
- **Data Persistence:** Automatically stores transactions in a local `transactions.json` file.
- **RESTful API:** Clean `GET`, `POST`, and `DELETE` endpoints.

---

## 📁 Project Structure

```text
final_proj_k/
│
├── server.js              # Express backend server & REST API
├── transactions.json      # Local JSON database (auto-created)
├── package.json           # Dependencies and scripts
│
└── public/                # Frontend files served statically
    ├── index.html         # HTML UI layout and dashboard
    ├── style.css          # Modern, sleek responsive design
    └── app.js             # Client-side API fetch and UI logic
```

---

## ⚡ Quick Start

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Run the server**:
   ```bash
   npm start
   ```

3. **Open in your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/transactions` | Fetch list of all transactions |
| `POST` | `/api/transactions` | Create a new transaction |
| `DELETE` | `/api/transactions/:id` | Remove a transaction by ID |
