document.addEventListener("DOMContentLoaded", () => {
    const openingBalanceInput = document.getElementById("opening-balance");
    const setBalanceButton = document.getElementById("set-balance");
    const currentBalanceDisplay = document.getElementById("current-balance");
    const balanceDisplaySection = document.getElementById("balance-display");
    const transactionForm = document.getElementById("transaction-form");
    const transactionsContainer = document.getElementById("transactions");

    let currentBalance = 0;

    setBalanceButton.addEventListener("click", () => {
        // Parse the input value as a float
        const openingBalance = parseFloat(openingBalanceInput.value);
    
        // Validate the input to ensure it's a number and greater than zero
        if (!isNaN(openingBalance) && openingBalance > 0) {
            // Disable the button to prevent multiple submissions
            setBalanceButton.disabled = true;
    
            // Make the POST request to the PHP backend
            fetch("set-balance.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ balance: openingBalance }), // Send the balance as JSON
            })
                .then((response) => {
                    // Ensure the response status is OK
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json(); // Parse the JSON response
                })
                .then((data) => {
                    if (data.success) {
                        // Update the current balance display
                        currentBalance = openingBalance;
                        currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
                        balanceDisplaySection.classList.remove("hidden");
                        alert("Balance set successfully!");
                    } else {
                        // Show the error message from the server
                        alert(data.error || "Error setting opening balance!");
                    }
                })
                .catch((error) => {
                    // Log and alert unexpected errors
                    console.error("Unexpected error:", error);
                    alert("An unexpected error occurred. Please try again later.");
                })
                .finally(() => {
                    // Re-enable the button after the request is complete
                    setBalanceButton.disabled = false;
                });
        } else {
            // Show an alert if the input is invalid
            alert("Please enter a valid positive balance.");
        }
    });
    
    function openEditForm(transactionId) {
        const transactionDiv = document.querySelector(`button[data-id="${transactionId}"]`).parentNode;
        const currentAmount = transactionDiv.querySelector(".transaction-amount").textContent;
    
        // Replace transaction details with an inline editing form
        transactionDiv.innerHTML = `
            <form class="edit-form">
                <label for="edit-amount">Amount:</label>
                <input type="number" id="edit-amount" value="${currentAmount}" required>
                <button type="submit" class="bg-green-500 text-white px-2 py-1 rounded">Save</button>
                <button type="button" class="cancel-edit bg-red-500 text-white px-2 py-1 rounded">Cancel</button>
            </form>
        `;
    
        // Add event listeners for Save and Cancel buttons
        transactionDiv.querySelector(".edit-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const newAmount = parseFloat(document.getElementById("edit-amount").value);
            if (newAmount > 0) {
                updateTransaction(transactionId, newAmount);
            } else {
                alert("Enter a valid amount!");
            }
        });
    
        transactionDiv.querySelector(".cancel-edit").addEventListener("click", () => {
            fetchTransactions(); // Reload the transactions list
        });
    }
    

    

    function fetchCurrentBalance() {
        fetch("fetch-balance.php")
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentBalance = data.balance;
                    currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
                    balanceDisplaySection.classList.remove("hidden");
                } else {
                    console.log(data.error || "Balance not set yet.");
                }
            })
            .catch(error => console.error("Error fetching current balance:", error));
    }


    // Fetch balance when the page loads
    
    fetchCurrentBalance();
    

    transactionForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const amount = parseFloat(document.getElementById("amount").value);
        const type = document.getElementById("type").value;
        const note = document.getElementById("note").value;

        if (!amount || amount <= 0) {
            alert("Enter a valid transaction amount!");
            return;
        }
        // Calculate the new balance based on transaction type
     const updatedBalance = type === "credit" ? currentBalance + amount : currentBalance - amount;
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
                currentBalance += type === "credit" ? amount : -amount;
                currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
                balanceDisplaySection.classList.remove("hidden");
            } else {
                alert(data.error || "Error setting opening balance!");
            }
        });
        fetchTransactions();
    });

    function updateTransaction(transactionId, newAmount) {
        fetch("edit-transaction.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: transactionId, amount: newAmount }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Transaction updated successfully!");
                    fetchTransactions(); // Reload the transactions list
                } else {
                    alert(data.error || "Failed to update transaction!");
                }
            })
            .catch(error => console.error("Error updating transaction:", error));
    }
    

    function fetchTransactions() {
        fetch("fetch-transactions.php")
            .then(response => response.json())
            .then(transactions => {
                const transactionsContainer = document.getElementById("transactions");
                transactionsContainer.innerHTML = ""; // Clear existing content
    
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
    
                // Add click event listeners for the Edit buttons
                document.querySelectorAll(".edit-transaction").forEach(button => {
                    button.addEventListener("click", (e) => {
                        const transactionId = e.target.getAttribute("data-id");
                        openEditForm(transactionId);
                    });
                });
            })
            .catch(error => console.error("Error fetching transactions:", error));
    }
    
    
    // Call the function to load transactions
    fetchTransactions();
    
    
});
const toggleThemeBtn = document.getElementById("theme-toggle");
        const body = document.body;

        const currentTheme = localStorage.getItem("theme") || "light";
        body.classList.add(currentTheme);

        toggleThemeBtn.textContent = currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";

        toggleThemeBtn.addEventListener("click", function () {
            body.classList.toggle("dark");
            const newTheme = body.classList.contains("dark") ? "dark" : "light";
            localStorage.setItem("theme", newTheme);
            toggleThemeBtn.textContent = newTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
        });



function fetchCurrentBalance() {
    fetch("fetch-current-balance.php")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentBalance = data.balance;
                currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
            } else {
                console.error("Error fetching current balance:", data.error);
            }
        })
        .catch(error => console.error("Network error:", error));
}
fetchCurrentBalance(); // Call this function when the page loads
