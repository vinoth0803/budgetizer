<?php
$firebase_url = "https://budgetizer-197bc-default-rtdb.firebaseio.com/balance.json";

// Decode input data
$input_data = json_decode(file_get_contents('php://input'), true);

if ($input_data) {
    $balance = $input_data['balance'];

    // Fetch existing balance data from Firebase
    $ch = curl_init($firebase_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $existing_data_response = curl_exec($ch);

    if (curl_errno($ch)) {
        $error = curl_error($ch);
        file_put_contents('error_log.txt', "CURL Error: $error\n", FILE_APPEND);
    }
    curl_close($ch);

    $existing_data = json_decode($existing_data_response, true);

    // Check if balance was already set today
    if ($existing_data && isset($existing_data['timestamp'])) {
        $last_set_date = date('Y-m-d', $existing_data['timestamp']);
        $current_date = date('Y-m-d');

        if ($last_set_date === $current_date) {
            echo json_encode(['success' => false, 'error' => 'Balance has already been set today.']);
            exit;
        }
    }

    // Update balance and timestamp in Firebase
    $data_to_update = [
        'amount' => $balance,
        'timestamp' => time() // Save current timestamp
    ];

    $ch = curl_init($firebase_url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data_to_update));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        $error = curl_error($ch);
        file_put_contents('error_log.txt', "CURL Error: $error\n", FILE_APPEND);
    }

    curl_close($ch);

    if ($response) {
        echo json_encode(['success' => true]);
    } else {
        file_put_contents('error_log.txt', "Response Error: $response\n", FILE_APPEND);
        echo json_encode(['success' => false, 'error' => 'Failed to update balance in Firebase.']);
    }
} else {
    file_put_contents('error_log.txt', "Invalid Input: " . json_encode($input_data) . "\n", FILE_APPEND);
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
}
?>
