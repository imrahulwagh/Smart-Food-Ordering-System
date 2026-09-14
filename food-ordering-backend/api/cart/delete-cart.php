<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


// =====================================================
// OPTIONS REQUEST
// =====================================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// =====================================================
// ONLY DELETE / POST ALLOWED
// =====================================================

if (
    $_SERVER['REQUEST_METHOD'] !== 'DELETE' &&
    $_SERVER['REQUEST_METHOD'] !== 'POST'
) {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only DELETE or POST request is allowed"
    ]);

    exit;
}


// =====================================================
// DATABASE CONFIG
// =====================================================

require_once __DIR__ . '/../../config/db.php';


// =====================================================
// GET INPUT DATA
// =====================================================

$data = [];


// DELETE request
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    $input = file_get_contents("php://input");

    if (!empty($input)) {

        $data = json_decode($input, true);

    }

}


// POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $input = file_get_contents("php://input");

    if (!empty($input)) {

        $data = json_decode($input, true);

    }

}


// =====================================================
// VALID JSON CHECK
// =====================================================

if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data"
    ]);

    exit;
}


// =====================================================
// CART ID CHECK
// =====================================================

if (
    !isset($data['cart_id']) ||
    empty($data['cart_id'])
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "cart_id is required"
    ]);

    exit;
}


$cartId = trim($data['cart_id']);


// =====================================================
// SUPABASE HEADERS
// =====================================================

$headers = [

    "apikey: " . $supabaseSecretKey,

    "Authorization: Bearer " . $supabaseSecretKey,

    "Content-Type: application/json",

    "Prefer: return=representation"

];


// =====================================================
// DELETE CART ITEM
// =====================================================

$url =
    $supabaseUrl .
    "/rest/v1/cart_items" .
    "?id=eq." .
    urlencode($cartId);


$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

curl_setopt($ch, CURLOPT_TIMEOUT, 30);


$response = curl_exec($ch);


// =====================================================
// CURL ERROR
// =====================================================

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


// =====================================================
// HTTP STATUS
// =====================================================

$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);


// =====================================================
// SUPABASE RESPONSE
// =====================================================

$result = json_decode(
    $response,
    true
);


// =====================================================
// DELETE FAILED
// =====================================================

if (
    $httpCode < 200 ||
    $httpCode >= 300
) {

    http_response_code($httpCode);

    echo json_encode([
        "success" => false,
        "message" => "Could not delete cart item",
        "details" => $result
    ]);

    exit;
}


// =====================================================
// SUCCESS
// =====================================================

echo json_encode([

    "success" => true,

    "message" => "Cart item deleted successfully",

    "cart_id" => $cartId

]);

?>