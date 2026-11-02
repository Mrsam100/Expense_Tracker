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

// ── State ─────────────────────────────────────────────────────
let transactions  = [];
let activeFilter  = 'all';
let currentSymbol = localStorage.getItem('budget_currency') || '$';

// Set currency selector default
currencySelect.value = currentSymbol;
amountLabel.textContent = `Amount (${currentSymbol})`;

// Set default date to today
dateInput.value = new Date().toISOString().split('T')[0];

// ── Currency Config ───────────────────────────────────────────
const currencyConfig = {
  '$': { locale: 'en-US', symbol: '$' },
  '₹': { locale: 'en-IN', symbol: '₹' }
};

function formatAmount(amount) {
  const cfg = currencyConfig[currentSymbol] || currencyConfig['$'];
  return currentSymbol + Number(amount).toLocaleString(cfg.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Currency switch event
currencySelect.addEventListener('change', () => {
  currentSymbol = currencySelect.value;
  localStorage.setItem('budget_currency', currentSymbol);
  amountLabel.textContent = `Amount (${currentSymbol})`;
  render();
});

// Category Icons
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

// ── 1. Fetch transactions from Spring Boot REST API ───────────
async function fetchTransactions() {
  try {
    const res = await fetch('/api/transactions');
    if (!res.ok) throw new Error('API response was not ok');
    transactions = await res.json();
    render();
  } catch (err) {
    console.warn('Backend API unavailable, using local cache:', err);
    const cached = localStorage.getItem('budget_transactions_cache');
    transactions = cached ? JSON.parse(cached) : [];
    render();
  }
}

// ── 2. Add Transaction ────────────────────────────────────────
transactionForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    title:    document.getElementById('title').value.trim(),
    amount:   parseFloat(document.getElementById('amount').value),
    type:     document.getElementById('type').value,
    category: document.getElementById('category').value,
    date:     document.getElementById('date').value
  };

  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const created = await res.json();
      transactions.unshift(created);
      localStorage.setItem('budget_transactions_cache', JSON.stringify(transactions));
      transactionForm.reset();
      dateInput.value = new Date().toISOString().split('T')[0];
      render();
    } else {
      const errText = await res.text();
      alert('Error saving transaction: ' + errText);
    }
  } catch (err) {
    console.error('Error connecting to Spring Boot backend:', err);
    // Offline fallback
    const offlineItem = { id: Date.now(), ...payload };
    transactions.unshift(offlineItem);
    localStorage.setItem('budget_transactions_cache', JSON.stringify(transactions));
    transactionForm.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    render();
  }
});

// ── 3. Delete Transaction ─────────────────────────────────────
async function deleteTransaction(id) {
  try {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      transactions = transactions.filter(t => t.id !== id);
      localStorage.setItem('budget_transactions_cache', JSON.stringify(transactions));
      render();
    }
  } catch (err) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('budget_transactions_cache', JSON.stringify(transactions));
    render();
  }
}

// ── 4. Reset All Modal ────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'flex';
});

modalCancel.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.style.display = 'none';
});

modalConfirm.addEventListener('click', async () => {
  try {
    await fetch('/api/transactions', { method: 'DELETE' });
  } catch (err) {
    console.warn('API reset failed, resetting locally:', err);
  }
  transactions = [];
  localStorage.setItem('budget_transactions_cache', JSON.stringify([]));
  modalOverlay.style.display = 'none';
  render();
});

// ── 5. Update Overview Cards ──────────────────────────────────
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

// Filter tabs
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderList();
  });
});

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function render() {
  updateStats();
  renderList();
}

// Initial load
fetchTransactions();
