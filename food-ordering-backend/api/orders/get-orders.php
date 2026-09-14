<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST request is allowed"
    ]);

    exit;
}

require_once __DIR__ . '/../../config/db.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!is_array($data)) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data"
    ]);

    exit;
}

if (empty($data['user_id'])) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "user_id is required"
    ]);

    exit;
}

$userId = trim($data['user_id']);

$headers = [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json"
];

/*
|--------------------------------------------------------------------------
| GET USER ORDERS
|--------------------------------------------------------------------------
*/

$orderUrl =
    $supabaseUrl .
    "/rest/v1/orders" .
    "?user_id=eq." . urlencode($userId) .
    "&select=*" .
    "&order=created_at.desc";

$ch = curl_init($orderUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);

if ($response === false) {

    $error = curl_error($ch);

    curl_close($ch);

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Could not fetch orders",
        "details" => $error
    ]);

    exit;
}

$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);

$orders = json_decode($response, true);

if ($httpCode < 200 || $httpCode >= 300) {

    http_response_code($httpCode);

    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch orders",
        "details" => $orders
    ]);

    exit;
}

if (!is_array($orders)) {
    $orders = [];
}

/*
|--------------------------------------------------------------------------
| FINAL RESPONSE
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => "Orders fetched successfully",
    "orders" => $orders
]);

?>