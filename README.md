# budgetizer
Budgetizer is a simple, web-based application designed to help you manage your personal finances effectively. It allows users to set an opening balance, record transactions (credit and debit), and view a history of transactions. The app uses Firebase Realtime Database to store data and provides a seamless experience for tracking expenses.
# Budgetizer

Budgetizer is a simple, responsive, and interactive budgeting application that helps users manage their expenses and income. It allows users to set an opening balance, record transactions (credit or debit), and view their transaction history with color-coded indicators.

## Features

- Set and store the opening balance in a Firebase Realtime Database.
- Add transactions as either credit (income) or debit (expense).
- Automatically update the balance based on transactions.
- View transaction history with color-coded indicators:
  - Green for credits
  - Red for debits
- Responsive design with a toggle for dark/light mode.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: PHP
- **Database**: Firebase Realtime Database

## File Structure

```plaintext
.
├── index.php                # Main application file
├── firebase/
│   └── firebase-config.js   # Firebase configuration file
├── assets/
│   └── js/
│       └── script.js        # JavaScript functionality
│   ├── set-balance.php  # API to set balance
│   ├── add-transaction.php  # API for adding transactions
│   ├── fetch-transactions.php # API for fetching transaction history
├── style.css                # Custom styles (optional)
├── README.md                # Project documentation
