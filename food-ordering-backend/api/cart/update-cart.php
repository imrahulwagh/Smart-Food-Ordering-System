<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only POST or PATCH allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Only POST or PATCH request is allowed"
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

if (!isset($data['cart_id']) || empty($data['cart_id'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "cart_id is required"
    ]);
    exit;
}

$cartId = trim($data['cart_id']);
$quantity = isset($data['quantity']) ? (int)$data['quantity'] : 1;

if ($quantity <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Quantity must be greater than 0"
    ]);
    exit;
}

$headers = [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json",
    "Prefer: return=representation"
];

$url = $supabaseUrl . "/rest/v1/cart_items?id=eq." . urlencode($cartId);

$payload = json_encode([
    "quantity" => $quantity
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
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
        "message" => "Could not connect to Supabase",
        "details" => $error
    ]);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

if ($httpCode < 200 || $httpCode >= 300) {
    http_response_code($httpCode);
    echo json_encode([
        "success" => false,
        "message" => "Could not update cart item",
        "details" => $result
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Cart item updated successfully",
    "cart_id" => $cartId,
    "quantity" => $quantity
]);
?>
