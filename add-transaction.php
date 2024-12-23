<?php
$firebase_url = "https://budgetizer-197bc-default-rtdb.firebaseio.com/transactions.json";

$input_data = json_decode(file_get_contents('php://input'), true);

if ($input_data) {
    // Add a timestamp to the transaction data
    $input_data['timestamp'] = time(); // Add current Unix timestamp

    $ch = curl_init($firebase_url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($input_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    if ($response) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
}
?>
