<?php
$firebase_transactions_url = "https://budgetizer-197bc-default-rtdb.firebaseio.com/transactions";
$firebase_balance_url = "https://budgetizer-197bc-default-rtdb.firebaseio.com/balance.json";

$input_data = json_decode(file_get_contents('php://input'), true);

if ($input_data && isset($input_data['id'], $input_data['amount'])) {
    $transaction_id = $input_data['id'];
    $new_amount = $input_data['amount'];

    // Fetch the old transaction details
    $ch = curl_init("{$firebase_transactions_url}/{$transaction_id}.json");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $existing_transaction_response = curl_exec($ch);
    curl_close($ch);

    if (!$existing_transaction_response) {
        echo json_encode(['success' => false, 'error' => 'Failed to fetch existing transaction']);
        exit;
    }

    $existing_transaction = json_decode($existing_transaction_response, true);

    if (!$existing_transaction || !isset($existing_transaction['amount'], $existing_transaction['type'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid transaction data']);
        exit;
    }

    $old_amount = $existing_transaction['amount'];
    $type = $existing_transaction['type'];

    // Calculate the balance adjustment
    $balance_adjustment = 0;
    if ($type === "credit") {
        $balance_adjustment = $new_amount - $old_amount; // Credit adjustment
    } elseif ($type === "debit") {
        $balance_adjustment = $old_amount - $new_amount; // Debit adjustment
    }

    // Update the transaction amount
    $ch = curl_init("{$firebase_transactions_url}/{$transaction_id}.json");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['amount' => $new_amount]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $update_transaction_response = curl_exec($ch);
    curl_close($ch);

    if (!$update_transaction_response) {
        echo json_encode(['success' => false, 'error' => 'Failed to update transaction']);
        exit;
    }

    // Update the balance
    $ch = curl_init($firebase_balance_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $balance_response = curl_exec($ch);
    curl_close($ch);

    if (!$balance_response) {
        echo json_encode(['success' => false, 'error' => 'Failed to fetch balance']);
        exit;
    }

    $current_balance_data = json_decode($balance_response, true);
    $current_balance = isset($current_balance_data['amount']) ? $current_balance_data['amount'] : 0;

    $new_balance = $current_balance + $balance_adjustment;

    $ch = curl_init($firebase_balance_url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['amount' => $new_balance]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $update_balance_response = curl_exec($ch);
    curl_close($ch);

    if ($update_balance_response) {
        echo json_encode(['success' => true, 'new_balance' => $new_balance]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update balance']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
}
?>
