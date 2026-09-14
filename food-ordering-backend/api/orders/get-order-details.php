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

if (empty($data['order_id']) || empty($data['user_id'])) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "order_id and user_id are required"
    ]);

    exit;
}

$orderId = (int)$data['order_id'];
$userId = trim($data['user_id']);

$headers = [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json"
];


/*
|--------------------------------------------------------------------------
| GET ORDER
|--------------------------------------------------------------------------
*/

$orderUrl =
    $supabaseUrl .
    "/rest/v1/orders" .
    "?id=eq." . $orderId .
    "&user_id=eq." . urlencode($userId) .
    "&select=*";

$ch = curl_init($orderUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$orderResponse = curl_exec($ch);

if ($orderResponse === false) {

    $error = curl_error($ch);

    curl_close($ch);

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Could not fetch order",
        "details" => $error
    ]);

    exit;
}

$orderHttpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);

$orderResult = json_decode(
    $orderResponse,
    true
);

if ($orderHttpCode < 200 || $orderHttpCode >= 300) {

    http_response_code($orderHttpCode);

    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch order",
        "details" => $orderResult
    ]);

    exit;
}

if (!is_array($orderResult) || count($orderResult) === 0) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Order not found"
    ]);

    exit;
}

$order = $orderResult[0];


/*
|--------------------------------------------------------------------------
| GET ORDER ITEMS
|--------------------------------------------------------------------------
*/

$itemsUrl =
    $supabaseUrl .
    "/rest/v1/order_items" .
    "?order_id=eq." . $orderId .
    "&select=*";

$ch = curl_init($itemsUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$itemsResponse = curl_exec($ch);

if ($itemsResponse === false) {

    $error = curl_error($ch);

    curl_close($ch);

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Could not fetch order items",
        "details" => $error
    ]);

    exit;
}

$itemsHttpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);

$itemsResult = json_decode(
    $itemsResponse,
    true
);

if ($itemsHttpCode < 200 || $itemsHttpCode >= 300) {

    http_response_code($itemsHttpCode);

    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch order items",
        "details" => $itemsResult
    ]);

    exit;
}

if (!is_array($itemsResult)) {
    $itemsResult = [];
}


/*
|--------------------------------------------------------------------------
| FINAL RESPONSE
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => "Order details fetched successfully",
    "order" => $order,
    "items" => $itemsResult
]);

?>