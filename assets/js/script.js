document.addEventListener("DOMContentLoaded", () => {
    const openingBalanceInput = document.getElementById("opening-balance");
    const setBalanceButton = document.getElementById("set-balance");
    const currentBalanceDisplay = document.getElementById("current-balance");
    const balanceDisplaySection = document.getElementById("balance-display");
    const transactionForm = document.getElementById("transaction-form");
    const transactionsContainer = document.getElementById("transactions");
    const toggleThemeBtn = document.getElementById("theme-toggle");

    let currentBalance = 0;

    // Fetch and display current balance
    function fetchCurrentBalance() {
        fetch("fetch-current-balance.php")
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentBalance = data.balance;
                    currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
                    balanceDisplaySection.classList.remove("hidden");
                } else {
                    console.error("Error fetching current balance:", data.error || "Balance not set yet.");
                }
            })
            .catch(error => console.error("Network error while fetching balance:", error));
    }

    // Fetch and display transactions
    function fetchTransactions() {
        fetch("fetch-transactions.php")
            .then(response => response.json())
            .then(transactions => {
                transactionsContainer.innerHTML = ""; // Clear previous transactions
                if (transactions.length === 0) {
                    transactionsContainer.innerHTML = "<p>No transactions available.</p>";
                } else {
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
                }
            })
            .catch(error => console.error("Error fetching transactions:", error));
    }

    // Set opening balance
    setBalanceButton.addEventListener("click", () => {
        const openingBalance = parseFloat(openingBalanceInput.value);

        if (!isNaN(openingBalance) && openingBalance > 0) {
            setBalanceButton.disabled = true;

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
                        alert("Balance set successfully!");
                        fetchTransactions(); // Reload transactions after setting balance
                    } else {
                        alert(data.error || "Error setting opening balance!");
                    }
                })
                .catch(error => {
                    console.error("Unexpected error while setting balance:", error);
                    alert("An unexpected error occurred. Please try again later.");
                })
                .finally(() => {
                    setBalanceButton.disabled = false;
                });
        } else {
            alert("Please enter a valid positive balance.");
        }
    });

    // Handle transactions (credit/debit)
    transactionForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const amount = parseFloat(document.getElementById("amount").value);
        const type = document.getElementById("type").value;
        const note = document.getElementById("note").value;

        if (!amount || amount <= 0) {
            alert("Enter a valid transaction amount!");
            return;
        }

        const updatedBalance = type === "credit" ? currentBalance + amount : currentBalance - amount;

        if (updatedBalance < 0) {
            alert("Insufficient balance for this transaction!");
            return;
        }

        const transaction = {
            amount,
            type,
            note,
            updatedBalance,
        };

        fetch("add-transaction.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transaction),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the balance in both the frontend and backend
                    currentBalance = updatedBalance;

                    // Update the displayed balance
                    currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
                    balanceDisplaySection.classList.remove("hidden");

                    // Fetch updated transactions
                    fetchTransactions();

                    alert("Transaction successful!");
                } else {
                    alert(data.error || "Error processing the transaction!");
                }
            })
            .catch(error => {
                console.error("Unexpected error during transaction:", error);
                alert("An unexpected error occurred. Please try again later.");
            });
    });

    // Theme toggle functionality
    const currentTheme = localStorage.getItem("theme") || "light";
    document.body.classList.add(currentTheme);
    toggleThemeBtn.textContent = currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";

    toggleThemeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const newTheme = document.body.classList.contains("dark") ? "dark" : "light";
        localStorage.setItem("theme", newTheme);
        toggleThemeBtn.textContent = newTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
    });

    // Initialize
    fetchCurrentBalance();
    fetchTransactions();
});
