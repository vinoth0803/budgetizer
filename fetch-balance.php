<?php
$firebase_url = "https://budgetizer-197bc-default-rtdb.firebaseio.com/balance.json";

// Fetch current balance data from Firebase
$ch = curl_init($firebase_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if ($data && isset($data['amount'])) {
    echo json_encode([
        'success' => true,
        'balance' => $data['amount'],
        'timestamp' => $data['timestamp']
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'No balance found']);
}
?>
