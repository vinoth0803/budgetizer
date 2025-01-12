document.addEventListener("DOMContentLoaded", () => {
    const openingBalanceInput = document.getElementById("opening-balance");
    const setBalanceButton = document.getElementById("set-balance");
    const currentBalanceDisplay = document.getElementById("current-balance");
    const balanceDisplaySection = document.getElementById("balance-display");
    const transactionForm = document.getElementById("transaction-form");
    const transactionsContainer = document.getElementById("transactions");

    let currentBalance = 0;

    // Function to set the opening balance
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
                    } else {
                        alert(data.error || "Error setting balance.");
                    }
                })
                .catch(error => alert("An unexpected error occurred. Please try again."))
                .finally(() => {
                    setBalanceButton.disabled = false;
                });
        } else {
            alert("Please enter a valid positive balance.");
        }
    });

    // Function to fetch the current balance
    function fetchCurrentBalance() {
        fetch("fetch-balance.php")
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentBalance = data.balance;
                    currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
                    balanceDisplaySection.classList.remove("hidden");
                } else {
                    console.error("Error fetching balance:", data.error);
                }
            })
            .catch(error => console.error("Error fetching balance:", error));
    }

    // Function to fetch and display transactions
    function fetchTransactions() {
        fetch("fetch-transactions.php")
            .then(response => response.json())
            .then(transactions => {
                transactionsContainer.innerHTML = ""; // Clear existing transactions

                transactions.forEach(transaction => {
                    const transactionDiv = document.createElement("div");
                    transactionDiv.className = `transaction-item p-4 mb-4 rounded shadow ${
                        transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                    }`;
                    transactionDiv.innerHTML = `
                        <p><strong>${transaction.type.toUpperCase()}:</strong> ₹<span class="transaction-amount">${transaction.amount}</span></p>
                        <p><strong>Note:</strong> ${transaction.note || "No note provided"}</p>
                        <p><strong>Date & Time:</strong> ${transaction.date_time || "N/A"}</p>
                        <button class="edit-transaction bg-blue-500 text-white px-2 py-1 rounded" data-id="${transaction.id}">Edit</button>
                    `;
                    transactionsContainer.appendChild(transactionDiv);
                });

                // Add edit button functionality
                document.querySelectorAll(".edit-transaction").forEach(button => {
                    button.addEventListener("click", (e) => {
                        const transactionId = e.target.getAttribute("data-id");
                        openEditForm(transactionId);
                    });
                });
            })
            .catch(error => console.error("Error fetching transactions:", error));
    }

    // Function to add a transaction
    transactionForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const amount = parseFloat(document.getElementById("amount").value);
        const type = document.getElementById("type").value;
        const note = document.getElementById("note").value;

        if (!amount || amount <= 0) {
            alert("Enter a valid transaction amount.");
            return;
        }

        const transaction = { amount, type, note };

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
                    alert(data.error || "Error adding transaction.");
                }
            })
            .catch(error => console.error("Error adding transaction:", error));
    });

    // Function to open the edit form
    function openEditForm(transactionId) {
        const transactionDiv = document.querySelector(`button[data-id="${transactionId}"]`).parentNode;
        const currentAmount = transactionDiv.querySelector(".transaction-amount").textContent;

        transactionDiv.innerHTML = `
            <form class="edit-form">
                <label for="edit-amount">Amount:</label>
                <input type="number" id="edit-amount" value="${currentAmount}" required>
                <button type="submit" class="bg-green-500 text-white px-2 py-1 rounded">Save</button>
                <button type="button" class="cancel-edit bg-red-500 text-white px-2 py-1 rounded">Cancel</button>
            </form>
        `;

        transactionDiv.querySelector(".edit-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const newAmount = parseFloat(document.getElementById("edit-amount").value);
            if (newAmount > 0) {
                updateTransaction(transactionId, newAmount);
            } else {
                alert("Enter a valid amount.");
            }
        });

        transactionDiv.querySelector(".cancel-edit").addEventListener("click", fetchTransactions);
    }

    // Function to update a transaction
    function updateTransaction(transactionId, newAmount) {
        // Fetch the original transaction details
        fetch(`fetch-transaction-details.php?id=${transactionId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const originalTransaction = data.transaction;
                    const originalAmount = parseFloat(originalTransaction.amount);
                    const originalType = originalTransaction.type;
    
                    // Calculate the balance adjustment
                    let balanceAdjustment = 0;
                    if (originalType === "credit") {
                        balanceAdjustment = -originalAmount + newAmount; // Credit change
                    } else if (originalType === "debit") {
                        balanceAdjustment = originalAmount - newAmount; // Debit change
                    }
    
                    // Update the transaction on the server
                    fetch("edit-transaction.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: transactionId, amount: newAmount }),
                    })
                        .then(response => response.json())
                        .then(updateData => {
                            if (updateData.success) {
                                // Update the current balance locally
                                currentBalance += balanceAdjustment;
                                currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
    
                                alert("Transaction updated successfully!");
                                fetchTransactions(); // Reload transactions
                            } else {
                                alert(updateData.error || "Failed to update transaction.");
                            }
                        })
                        .catch(error => console.error("Error updating transaction:", error));
                } else {
                    alert(data.error || "Failed to fetch original transaction details.");
                }
            })
            .catch(error => console.error("Error fetching transaction details:", error));
    }

    // Fetch data on page load
    fetchCurrentBalance();
    fetchTransactions();

    // Theme toggle
    const toggleThemeBtn = document.getElementById("theme-toggle");
    const body = document.body;
    const currentTheme = localStorage.getItem("theme") || "light";

    body.classList.add(currentTheme);
    toggleThemeBtn.textContent = currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";

    toggleThemeBtn.addEventListener("click", () => {
        body.classList.toggle("dark");
        const newTheme = body.classList.contains("dark") ? "dark" : "light";
        localStorage.setItem("theme", newTheme);
        toggleThemeBtn.textContent = newTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
    });
});
