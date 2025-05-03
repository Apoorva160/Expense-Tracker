// Select DOM elements
const form = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");
const balanceEl = document.getElementById("balance");

// Get charts canvas
const pieCanvas = document.getElementById("pieChart");
const barCanvas = document.getElementById("barChart");

// Data
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Chart instances
let pieChart;
let barChart;

// Add transaction
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const amount = +document.getElementById("amount").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  if (!title || !amount || !category || !date) return;

  const transaction = {
    id: Date.now(),
    title,
    amount,
    type,
    category,
    date,
  };

  transactions.push(transaction);
  updateUI();
  form.reset();
});

// Delete transaction
function deleteTransaction(id) {
  transactions = transactions.filter((tx) => tx.id !== id);
  updateUI();
}

// Update UI
function updateUI() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  updateBalance();
  updateCharts();
}

// Render transaction list
function renderTransactions() {
  transactionList.innerHTML = "";
  transactions.forEach((tx) => {
    const div = document.createElement("div");
    div.className = `transaction ${tx.type}`;
    div.innerHTML = `
      <span>${tx.title} (${tx.category})</span>
      <div>
        <span class="amount">${tx.type === "expense" ? "-" : "+"} ₹${tx.amount}</span>
        <button class="delete-btn" onclick="deleteTransaction(${tx.id})">✖</button>
      </div>
    `;
    transactionList.appendChild(div);
  });
}

// Update balance
function updateBalance() {
  let income = 0, expense = 0;
  transactions.forEach(tx => {
    tx.type === "income" ? income += tx.amount : expense += tx.amount;
  });
  const balance = income - expense;
  balanceEl.textContent = `Balance: ₹${balance}`;
}

// Update charts
function updateCharts() {
  const expenseData = transactions.filter(tx => tx.type === "expense");

  // Pie chart: Expenses by category
  const categoryMap = {};
  expenseData.forEach(tx => {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
  });

  const pieLabels = Object.keys(categoryMap);
  const pieValues = Object.values(categoryMap);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCanvas, {
    type: "pie",
    data: {
      labels: pieLabels,
      datasets: [{
        data: pieValues,
        backgroundColor: ["#ef5350", "#66bb6a", "#42a5f5", "#ffca28", "#ab47bc"]
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Expenses by Category"
        }
      }
    }
  });

  // Bar chart: Monthly total expenses
  const monthMap = {};
  expenseData.forEach(tx => {
    const month = tx.date.slice(0, 7); // yyyy-mm
    monthMap[month] = (monthMap[month] || 0) + tx.amount;
  });

  const barLabels = Object.keys(monthMap).sort();
  const barValues = barLabels.map(month => monthMap[month]);

  if (barChart) barChart.destroy();
  barChart = new Chart(barCanvas, {
    type: "bar",
    data: {
      labels: barLabels,
      datasets: [{
        label: "Monthly Expenses",
        data: barValues,
        backgroundColor: "#42a5f5"
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
// Select the search input element
const searchInput = document.getElementById("search");

// Function to filter transactions based on the search input
function filterTransactions(searchTerm) {
  return transactions.filter((tx) => {
    // Convert both search term and transaction title/category to lowercase for case-insensitive matching
    const searchLower = searchTerm.toLowerCase();
    return tx.title.toLowerCase().includes(searchLower) || tx.category.toLowerCase().includes(searchLower);
  });
}

// Event listener for the search input to filter transactions
searchInput.addEventListener("input", function (e) {
  const searchTerm = e.target.value.trim();
  renderTransactions(searchTerm); // Render filtered transactions based on search input
  updateBalance();
  updateCharts();
});

// Render transactions based on the search term
function renderTransactions(searchTerm = "") {
  transactionList.innerHTML = ""; // Clear current transaction list

  // Filter transactions if there's a search term
  const filteredTransactions = searchTerm ? filterTransactions(searchTerm) : transactions;

  filteredTransactions.forEach((tx) => {
    const div = document.createElement("div");
    div.className = `transaction ${tx.type}`;
    div.innerHTML = `
      <span>${tx.title} (${tx.category})</span>
      <div>
        <span class="amount">${tx.type === "expense" ? "-" : "+"} ₹${tx.amount}</span>
        <button class="delete-btn" onclick="deleteTransaction(${tx.id})">✖</button>
      </div>
    `;
    transactionList.appendChild(div);
  });
}

// Update UI
function updateUI() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions(); // No filter applied when called directly
  updateBalance();
  updateCharts();
}


// Reset all data
const resetButton = document.createElement("button");
resetButton.textContent = "Reset All Data";
resetButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all data?")) {
    transactions = [];
    localStorage.removeItem("transactions");
    updateUI();
  }
});
document.body.appendChild(resetButton);
function downloadCSV() {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  
    if (transactions.length === 0) {
      alert("No transactions to download.");
      return;
    }
  
    const header = "Title,Amount,Type,Category,Date";
    const rows = transactions.map(tx =>
      `"${tx.title}",${tx.amount},${tx.type},${tx.category},${tx.date}`
    );
  
    const csvContent = [header, ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
  
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  

// Export transactions to CSV
const exportButton = document.createElement("button");
exportButton.textContent = "Export to CSV";
exportButton.addEventListener("click", () => {
  const csvContent = transactions.map(tx => {
    return `${tx.title},${tx.amount},${tx.type},${tx.category},${tx.date}`;
  }).join("\n");

  const csvHeader = "Title,Amount,Type,Category,Date";
  const finalCsv = `${csvHeader}\n${csvContent}`;

  const blob = new Blob([finalCsv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  }
});
document.body.appendChild(exportButton);

// Initial load
updateUI();
