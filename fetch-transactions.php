<?php
$firebase_url = "https://budgetizer-197bc-default-rtdb.firebaseio.com/transactions.json";

$ch = curl_init($firebase_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

if ($response) {
    $data = json_decode($response, true);
    $transactions = [];
    foreach ($data as $key => $value) {
        $transactions[] = $value;
    }
    echo json_encode($transactions);
} else {
    echo json_encode([]);
}
?>
