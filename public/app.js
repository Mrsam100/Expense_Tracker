// DOM Elements
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const transactionForm = document.getElementById('transactionForm');
const transactionList = document.getElementById('transactionList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.tab-btn');
const dateInput = document.getElementById('date');
const currencySelect = document.getElementById('currencySelect');
const amountLabel = document.getElementById('amountLabel');
const resetBtn = document.getElementById('resetBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

// Set default date to today
dateInput.value = new Date().toISOString().split('T')[0];

// State
let transactions = [];
let activeFilter = 'all';
let currentSymbol = '$'; // default currency symbol

// Currency config
const currencyConfig = {
  '$': { locale: 'en-US', symbol: '$', name: 'USD' },
  '₹': { locale: 'en-IN', symbol: '₹', name: 'INR' }
};

// Currency change handler
currencySelect.addEventListener('change', () => {
  currentSymbol = currencySelect.value;
  amountLabel.textContent = `Amount (${currentSymbol})`;
  render(); // re-render all amounts with new symbol
});

// Format amount with selected currency
function formatAmount(amount) {
  const cfg = currencyConfig[currentSymbol];
  return currentSymbol + Number(amount).toLocaleString(cfg.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ── Reset logic ──────────────────────────────────────────────
// Open modal
resetBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'flex';
});

// Cancel: close modal
modalCancel.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
});

// Close modal on backdrop click
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.style.display = 'none';
});

// Confirm: wipe all transactions
modalConfirm.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/transactions', { method: 'DELETE' });
    if (res.ok) {
      transactions = [];
      modalOverlay.style.display = 'none';
      render();
    }
  } catch (err) {
    console.error('Error resetting transactions:', err);
  }
});

// Category emoji mapper
const categoryIcons = {
  Salary: '💰',
  Freelance: '💻',
  Food: '🍔',
  Housing: '🏠',
  Utilities: '💡',
  Entertainment: '🎬',
  Shopping: '🛍️',
  Health: '💊',
  Other: '📦'
};

// 1. Fetch transactions from backend
async function fetchTransactions() {
  try {
    const res = await fetch('/api/transactions');
    transactions = await res.json();
    render();
  } catch (err) {
    console.error('Failed to load transactions:', err);
  }
}

// 2. Add a new transaction
transactionForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const amount = document.getElementById('amount').value;
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  const payload = { title, amount, type, category, date };

  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const createdItem = await res.json();
      transactions.unshift(createdItem);
      transactionForm.reset();
      dateInput.value = new Date().toISOString().split('T')[0];
      render();
    }
  } catch (err) {
    console.error('Error adding transaction:', err);
  }
});

// 3. Delete a transaction
async function deleteTransaction(id) {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      transactions = transactions.filter(item => item.id !== id);
      render();
    }
  } catch (err) {
    console.error('Error deleting transaction:', err);
  }
}

// 4. Update Overview Statistics
function updateStats() {
  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    const amt = Number(t.amount);
    if (t.type === 'income') {
      income += amt;
    } else {
      expense += amt;
    }
  });

  const balance = income - expense;

  totalBalanceEl.textContent = formatAmount(balance);
  totalIncomeEl.textContent = '+' + formatAmount(income);
  totalExpenseEl.textContent = '-' + formatAmount(expense);
}

// 5. Render Transaction List
function renderList() {
  transactionList.innerHTML = '';

  const filtered = transactions.filter(t => {
    if (activeFilter === 'all') return true;
    return t.type === activeFilter;
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  filtered.forEach(item => {
    const li = document.createElement('li');
    li.className = 'transaction-item';

    const icon = categoryIcons[item.category] || '📦';
    const isIncome = item.type === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'income' : 'expense';

    li.innerHTML = `
      <div class="t-details">
        <div class="t-icon-box">${icon}</div>
        <div class="t-meta">
          <h4>${escapeHtml(item.title)}</h4>
          <span>${item.category} • ${item.date}</span>
        </div>
      </div>
      <div class="t-actions">
        <span class="t-amount ${amountClass}">${sign}${formatAmount(item.amount)}</span>
        <button class="delete-btn" title="Delete transaction" onclick="deleteTransaction(${item.id})">✕</button>
      </div>
    `;

    transactionList.appendChild(li);
  });
}

// Filter button toggle
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderList();
  });
});

// Helper: Escape HTML to prevent basic XSS
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Master Render function
function render() {
  updateStats();
  renderList();
}

// Initial fetch on app start
fetchTransactions();
