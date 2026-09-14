<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, PATCH, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


// ==========================================
// OPTIONS REQUEST
// ==========================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;
}


// ==========================================
// ALLOWED REQUEST
// ==========================================

if (
    $_SERVER['REQUEST_METHOD'] !== 'PUT' &&
    $_SERVER['REQUEST_METHOD'] !== 'PATCH' &&
    $_SERVER['REQUEST_METHOD'] !== 'POST'
) {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only PUT, PATCH or POST request is allowed"
    ]);

    exit;
}


// ==========================================
// DATABASE CONFIG
// ==========================================

require_once __DIR__ . '/../../config/db.php';


// ==========================================
// READ JSON DATA
// ==========================================

$input = json_decode(
    file_get_contents("php://input"),
    true
);


// ==========================================
// CHECK INPUT
// ==========================================

if (!is_array($input)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data"
    ]);

    exit;
}


// ==========================================
// GET ORDER ID AND STATUS
// ==========================================

$orderId =
    $input['order_id']
    ?? null;

$status =
    $input['status']
    ?? null;


// ==========================================
// REQUIRED FIELDS
// ==========================================

if (!$orderId || !$status) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Order ID and status are required"
    ]);

    exit;
}


// ==========================================
// ALLOWED STATUSES
// ==========================================

$allowedStatuses = [

    "Pending",
    "Confirmed",
    "Preparing",
    "Ready",
    "Out for Delivery",
    "Delivered",
    "Cancelled"

];


if (!in_array($status, $allowedStatuses)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid order status"
    ]);

    exit;
}


// ==========================================
// SUPABASE HEADERS
// ==========================================

$headers = [

    "apikey: " . $supabaseSecretKey,

    "Authorization: Bearer " . $supabaseSecretKey,

    "Content-Type: application/json",

    "Prefer: return=representation"

];


// ==========================================
// UPDATE ORDER
// ==========================================

$orderUrl =
    $supabaseUrl .
    "/rest/v1/orders?id=eq." .
    urlencode($orderId);


// ==========================================
// UPDATE DATA
// ==========================================

$data = [

    "status" => $status,

    "order_status" => $status

];


// ==========================================
// CURL
// ==========================================

$ch = curl_init($orderUrl);

curl_setopt(
    $ch,
    CURLOPT_RETURNTRANSFER,
    true
);

curl_setopt(
    $ch,
    CURLOPT_CUSTOMREQUEST,
    "PATCH"
);

curl_setopt(
    $ch,
    CURLOPT_HTTPHEADER,
    $headers
);

curl_setopt(
    $ch,
    CURLOPT_POSTFIELDS,
    json_encode($data)
);

curl_setopt(
    $ch,
    CURLOPT_CONNECTTIMEOUT,
    10
);

curl_setopt(
    $ch,
    CURLOPT_TIMEOUT,
    30
);


// ==========================================
// EXECUTE
// ==========================================

$response = curl_exec($ch);


// ==========================================
// CURL ERROR
// ==========================================

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


// ==========================================
// HTTP STATUS
// ==========================================

$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);


// ==========================================
// DECODE RESPONSE
// ==========================================

$result = json_decode(
    $response,
    true
);


// ==========================================
// SUPABASE ERROR
// ==========================================

if (
    $httpCode < 200 ||
    $httpCode >= 300
) {

    http_response_code($httpCode);

    echo json_encode([

        "success" => false,

        "message" => "Failed to update order status",

        "details" => $result

    ]);

    exit;
}


// ==========================================
// SUCCESS
// ==========================================

echo json_encode([

    "success" => true,

    "message" =>
        "Order status updated successfully",

    "order_id" =>
        $orderId,

    "status" =>
        $status,

    "order" =>
        $result

]);

?>