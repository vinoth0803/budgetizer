<?php
header('Content-Type: application/json');

$firebase_url = "https://budgetizer-197bc-default-rtdb.firebaseio.com/balance.json";

$input_data = json_decode(file_get_contents('php://input'), true);

if ($input_data && isset($input_data['balance'])) {
    $balance = $input_data['balance'];

    // Fetch existing balance data
    $ch = curl_init($firebase_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $existing_data_response = curl_exec($ch);
    curl_close($ch);

    $existing_data = json_decode($existing_data_response, true);

    // Check if balance is already set for today
    $current_date = date('Y-m-d');
    if ($existing_data && isset($existing_data['timestamp'])) {
        $last_set_date = date('Y-m-d', $existing_data['timestamp']);
        if ($last_set_date === $current_date) {
            echo json_encode(['success' => false, 'error' => 'Balance already set today.']);
            exit;
        }
    }

    // Update balance and timestamp
    $data_to_update = [
        'amount' => $balance,
        'timestamp' => time(),
    ];

    $ch = curl_init($firebase_url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data_to_update));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    if ($response) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update balance in database.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid input.']);
}
