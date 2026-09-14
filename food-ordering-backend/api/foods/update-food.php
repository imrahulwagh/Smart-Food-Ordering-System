<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, PATCH, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once "../../config/db.php";


// ===============================
// Check Method
// ===============================

if (
    $_SERVER['REQUEST_METHOD'] !== 'PUT' &&
    $_SERVER['REQUEST_METHOD'] !== 'PATCH' &&
    $_SERVER['REQUEST_METHOD'] !== 'POST'
) {
    echo json_encode([
        "success" => false,
        "message" => "Only PUT, PATCH or POST method is allowed."
    ]);
    exit;
}


// ===============================
// Get Request Data
// ===============================

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request data."
    ]);
    exit;
}


// ===============================
// Food ID
// ===============================

$id = $data['id'] ?? null;

if (!$id) {
    echo json_encode([
        "success" => false,
        "message" => "Food ID is required."
    ]);
    exit;
}


// ===============================
// Food Fields
// ===============================

$category_id = $data['category_id'] ?? null;
$name = trim($data['name'] ?? '');
$description = trim($data['description'] ?? '');
$price = $data['price'] ?? null;
$image = trim($data['image'] ?? '');
$s_available = $data['s_available'] ?? true;


// ===============================
// Validation
// ===============================

if (!$category_id) {
    echo json_encode([
        "success" => false,
        "message" => "Category ID is required."
    ]);
    exit;
}

if ($name === '') {
    echo json_encode([
        "success" => false,
        "message" => "Food name is required."
    ]);
    exit;
}

if ($price === null || $price === '' || !is_numeric($price)) {
    echo json_encode([
        "success" => false,
        "message" => "Valid price is required."
    ]);
    exit;
}


// ===============================
// Update Data
// ===============================

$foodData = [
    "category_id" => (int)$category_id,
    "name" => $name,
    "description" => $description,
    "price" => (float)$price,
    "image" => $image,
    "s_available" => (bool)$s_available
];


// ===============================
// Supabase URL
// ===============================

$url = $supabaseUrl . "/rest/v1/food_items?id=eq." . (int)$id;


// ===============================
// Update Food
// ===============================

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($foodData));

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json",
    "Prefer: return=representation"
]);

$response = curl_exec($ch);

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

curl_close($ch);


// ===============================
// CURL Error
// ===============================

if ($curlError) {
    echo json_encode([
        "success" => false,
        "message" => "Connection error.",
        "error" => $curlError
    ]);
    exit;
}


// ===============================
// Supabase Error
// ===============================

if ($httpCode < 200 || $httpCode >= 300) {

    $errorData = json_decode($response, true);

    echo json_encode([
        "success" => false,
        "message" => $errorData['message'] ?? "Unable to update food.",
        "error" => $response
    ]);

    exit;
}


// ===============================
// Success
// ===============================

$food = json_decode($response, true);

echo json_encode([
    "success" => true,
    "message" => "Food updated successfully.",
    "food" => $food[0] ?? $food
]);

?>