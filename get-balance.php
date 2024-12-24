<?php
$firebase_url = "https://budgetizer-197bc-default-rtdb.firebaseio.com/balance.json";

// Fetch the balance from Firebase
$ch = curl_init($firebase_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$balance_data = json_decode($response, true);

// Check if the balance data exists
if ($balance_data && isset($balance_data['amount'])) {
    echo json_encode(['success' => true, 'balance' => $balance_data['amount']]);
} else {
    echo json_encode(['success' => false, 'error' => 'Balance not found']);
}
?>
