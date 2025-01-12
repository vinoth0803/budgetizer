<?php
$firebase_url_transactions = "https://budgetizer-197bc-default-rtdb.firebaseio.com/transactions.json";
$firebase_url_balance = "https://budgetizer-197bc-default-rtdb.firebaseio.com/balance.json";

// Decode input data
$input_data = json_decode(file_get_contents('php://input'), true);

if ($input_data) {
    $amount = $input_data['amount'];
    $type = $input_data['type'];
    $note = $input_data['note'];
    $timestamp = time();

    // Fetch the current balance
    $ch = curl_init($firebase_url_balance);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $balance_response = curl_exec($ch);
    curl_close($ch);

    $current_balance_data = json_decode($balance_response, true);
    $current_balance = $current_balance_data['amount'] ?? 0;

    // Calculate the new balance
    if ($type === "credit") {
        $new_balance = $current_balance + $amount;
    } else if ($type === "debit") {
        $new_balance = $current_balance - $amount;
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid transaction type']);
        exit;
    }

    // Update the balance in Firebase
    $balance_data = [
        'amount' => $new_balance,
        'timestamp' => $timestamp
    ];
    $ch = curl_init($firebase_url_balance);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($balance_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $balance_update_response = curl_exec($ch);
    curl_close($ch);

    if (!$balance_update_response) {
        echo json_encode(['success' => false, 'error' => 'Failed to update balance']);
        exit;
    }

    // Add the transaction to Firebase
    $transaction_data = [
        'amount' => $amount,
        'type' => $type,
        'note' => $note,
        'timestamp' => $timestamp
    ];
    $ch = curl_init($firebase_url_transactions);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($transaction_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $transaction_response = curl_exec($ch);
    curl_close($ch);

    if ($transaction_response) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to add transaction']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
}
?>
