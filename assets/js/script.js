document.addEventListener("DOMContentLoaded", () => {
    const openingBalanceInput = document.getElementById("opening-balance");
    const setBalanceButton = document.getElementById("set-balance");
    const currentBalanceDisplay = document.getElementById("current-balance");
    const balanceDisplaySection = document.getElementById("balance-display");
    const transactionForm = document.getElementById("transaction-form");
    const transactionsContainer = document.getElementById("transactions");

    let currentBalance = 0;

    setBalanceButton.addEventListener("click", () => {
        const openingBalance = parseFloat(openingBalanceInput.value);
        if (!isNaN(openingBalance)) {
            fetch("set-balance.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ balance: openingBalance }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentBalance = openingBalance;
                    currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
                    balanceDisplaySection.classList.remove("hidden");
                } else {
                    alert("Error setting opening balance!");
                }
            });
        }
    });

    transactionForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const amount = parseFloat(document.getElementById("amount").value);
        const type = document.getElementById("type").value;
        const note = document.getElementById("note").value;

        if (!amount || amount <= 0) {
            alert("Enter a valid transaction amount!");
            return;
        }

        const transaction = {
            amount,
            type,
            note,
        };

        fetch("add-transaction.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transaction),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentBalance += type === "credit" ? amount : -amount;
                currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
                fetchTransactions();
            } else {
                alert("Error adding transaction!");
            }
        });
    });

    function fetchTransactions() {
        fetch("fetch-transactions.php")
            .then(response => response.json())
            .then(transactions => {
                const transactionsContainer = document.getElementById('transactions');
                transactionsContainer.innerHTML = ""; // Clear existing content
    
                transactions.forEach(transaction => {
                    const transactionDiv = document.createElement("div");
                    transactionDiv.className = `transaction-item p-4 mb-4 rounded shadow ${
                        transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                    }`;
                    transactionDiv.innerHTML = `
                        <p><strong>${transaction.type.toUpperCase()}:</strong> ₹${transaction.amount}</p>
                        <p><strong>Note:</strong> ${transaction.note || "No note provided"}</p>
                        <p><strong>Date & Time:</strong> ${transaction.date_time || "N/A"}</p>
                    `;
                    transactionsContainer.appendChild(transactionDiv);
                });
            })
            .catch(error => console.error("Error fetching transactions:", error));
    }
    
    // Call the function to load transactions
    fetchTransactions();
    
    
});
const toggleThemeBtn = document.getElementById("theme-toggle");

toggleThemeBtn.addEventListener("click", function () {
    const body = document.body;
    body.classList.toggle("dark");
    
    if (body.classList.contains("dark")) {
        toggleThemeBtn.textContent = "Switch to Light Mode";
    } else {
        toggleThemeBtn.textContent = "Switch to Dark Mode";
    }
});
