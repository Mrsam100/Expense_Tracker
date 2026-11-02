// ── DOM Elements ─────────────────────────────────────────────
const totalBalanceEl  = document.getElementById('totalBalance');
const totalIncomeEl   = document.getElementById('totalIncome');
const totalExpenseEl  = document.getElementById('totalExpense');
const transactionForm = document.getElementById('transactionForm');
const transactionList = document.getElementById('transactionList');
const emptyState      = document.getElementById('emptyState');
const filterBtns      = document.querySelectorAll('.tab-btn');
const dateInput       = document.getElementById('date');
const currencySelect  = document.getElementById('currencySelect');
const amountLabel     = document.getElementById('amountLabel');
const resetBtn        = document.getElementById('resetBtn');
const modalOverlay    = document.getElementById('modalOverlay');
const modalCancel     = document.getElementById('modalCancel');
const modalConfirm    = document.getElementById('modalConfirm');

// ── Constants ─────────────────────────────────────────────────
const STORAGE_KEY = 'budget_tracker_transactions';

// ── State ─────────────────────────────────────────────────────
let transactions  = [];
let activeFilter  = 'all';
let currentSymbol = '$';

// ── Set default date to today ─────────────────────────────────
dateInput.value = new Date().toISOString().split('T')[0];

// ── Currency Config ───────────────────────────────────────────
const currencyConfig = {
  '$': { locale: 'en-US', symbol: '$' },
  '₹': { locale: 'en-IN', symbol: '₹' }
};

// ── localStorage helpers ──────────────────────────────────────
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultData();
  } catch {
    return getDefaultData();
  }
}

function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDefaultData() {
  return [
    { id: 1, title: 'Salary',    amount: 3500, type: 'income',  category: 'Salary',  date: new Date().toISOString().split('T')[0] },
    { id: 2, title: 'House Rent',amount: 1200, type: 'expense', category: 'Housing', date: new Date().toISOString().split('T')[0] },
    { id: 3, title: 'Groceries', amount: 150,  type: 'expense', category: 'Food',    date: new Date().toISOString().split('T')[0] }
  ];
}

// ── Format amount with selected currency ──────────────────────
function formatAmount(amount) {
  const cfg = currencyConfig[currentSymbol];
  return currentSymbol + Number(amount).toLocaleString(cfg.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ── Currency change handler ───────────────────────────────────
currencySelect.addEventListener('change', () => {
  currentSymbol = currencySelect.value;
  amountLabel.textContent = `Amount (${currentSymbol})`;
  render();
});

// ── Category Icons ────────────────────────────────────────────
const categoryIcons = {
  Salary:        '💰',
  Freelance:     '💻',
  Food:          '🍔',
  Housing:       '🏠',
  Utilities:     '💡',
  Entertainment: '🎬',
  Shopping:      '🛍️',
  Health:        '💊',
  Other:         '📦'
};

// ── 1. Load transactions from localStorage ────────────────────
function fetchTransactions() {
  transactions = loadFromStorage();
  render();
}

// ── 2. Add a new transaction ──────────────────────────────────
transactionForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newTransaction = {
    id:       Date.now(),
    title:    document.getElementById('title').value.trim(),
    amount:   parseFloat(document.getElementById('amount').value),
    type:     document.getElementById('type').value,
    category: document.getElementById('category').value,
    date:     document.getElementById('date').value
  };

  transactions.unshift(newTransaction);
  saveToStorage(transactions);

  transactionForm.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
  render();
});

// ── 3. Delete a single transaction ───────────────────────────
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage(transactions);
  render();
}

// ── 4. Reset All modal logic ──────────────────────────────────
resetBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'flex';
});

modalCancel.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.style.display = 'none';
});

modalConfirm.addEventListener('click', () => {
  transactions = [];
  saveToStorage(transactions);
  modalOverlay.style.display = 'none';
  render();
});

// ── 5. Update Summary Cards ───────────────────────────────────
function updateStats() {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    if (t.type === 'income') income  += Number(t.amount);
    else                     expense += Number(t.amount);
  });
  const balance = income - expense;
  totalBalanceEl.textContent = formatAmount(balance);
  totalIncomeEl.textContent  = '+' + formatAmount(income);
  totalExpenseEl.textContent = '-' + formatAmount(expense);
}

// ── 6. Render Transaction List ────────────────────────────────
function renderList() {
  transactionList.innerHTML = '';

  const filtered = transactions.filter(t =>
    activeFilter === 'all' ? true : t.type === activeFilter
  );

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach(item => {
    const li          = document.createElement('li');
    li.className      = 'transaction-item';
    const icon        = categoryIcons[item.category] || '📦';
    const isIncome    = item.type === 'income';
    const sign        = isIncome ? '+' : '-';
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
        <button class="delete-btn" title="Delete" onclick="deleteTransaction(${item.id})">✕</button>
      </div>
    `;
    transactionList.appendChild(li);
  });
}

// ── Filter tab toggle ─────────────────────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderList();
  });
});

// ── Escape HTML helper ────────────────────────────────────────
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ── Master render ─────────────────────────────────────────────
function render() {
  updateStats();
  renderList();
}

// ── Boot ──────────────────────────────────────────────────────
fetchTransactions();
