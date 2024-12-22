<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Budgetizer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.3.2/dist/tailwind.min.css" rel="stylesheet">
    <style>
        body.dark {
            background-color: #333;
            color: #fff;
        }
    </style>
</head>
<body class="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <div class="container mx-auto p-6">
        <header class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Budgetizer</h1>
            <button id="theme-toggle" class="bg-green-500 text-white px-4 py-2 rounded">Toggle Dark Mode</button>
        </header>

        <section class="mb-6">
            <label for="opening-balance" class="block font-semibold">Opening Balance</label>
            <input
                type="number"
                id="opening-balance"
                class="w-full mt-2 p-2 border rounded"
                placeholder="Enter your opening balance"
            />
            <button id="set-balance" class="mt-4 bg-green-500 text-white px-4 py-2 rounded">Set Balance</button>
        </section>

        <!-- Display Opening Balance -->
        <section id="balance-display" class="mb-6 hidden">
            <h2 class="text-2xl font-bold">Current Balance</h2>
            <p id="current-balance" class="mt-2 text-xl bg-white p-4 rounded shadow">₹0.00</p>
        </section>

        <section class="mb-6">
            <h2 class="text-2xl font-bold mb-4">Add Transaction</h2>
            <form id="transaction-form">
                <div class="mb-4">
                    <label for="amount" class="block font-semibold">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        class="w-full mt-2 p-2 border rounded"
                        required
                    />
                </div>
                <div class="mb-4">
                    <label for="type" class="block font-semibold">Type</label>
                    <select id="type" class="w-full mt-2 p-2 border rounded">
                        <option value="credit">Credit</option>
                        <option value="debit">Debit</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label for="note" class="block font-semibold">Note</label>
                    <textarea
                        id="note"
                        class="w-full mt-2 p-2 border rounded"
                        placeholder="Add a note for the transaction"
                    ></textarea>
                </div>
                <button
                    type="submit"
                    class="bg-green-500 text-white px-4 py-2 rounded"
                >Add Transaction</button>
            </form>
        </section>

        <section>
            <h2 class="text-2xl font-bold mb-4">Transaction History</h2>
            <div id="transactions" class="bg-white p-4 rounded shadow"></div>
        </section>
    </div>

    <script src="assets/js/firebase-config.js"></script>
    <script src="assets/js/script.js"></script>
    <!-- <script>
        // Dark Mode Toggle Script
        document.addEventListener("DOMContentLoaded", function () {
            const toggleThemeBtn = document.getElementById("theme-toggle");

            toggleThemeBtn.addEventListener("click", function () {
                document.body.classList.toggle("dark");
            });
        });
    </script> -->
</body>
</html>
