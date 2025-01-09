<?php
$firebase_url = "https://budgetizer-197bc-default-rtdb.firebaseio.com/transactions";

$input_data = json_decode(file_get_contents('php://input'), true);

if ($input_data && isset($input_data['id'], $input_data['amount'])) {
    $transaction_id = $input_data['id'];
    $new_amount = $input_data['amount'];

    $ch = curl_init("{$firebase_url}/{$transaction_id}.json");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['amount' => $new_amount]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    if ($response) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update transaction']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
}
?>
