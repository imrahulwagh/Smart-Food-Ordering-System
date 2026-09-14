<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once "../../config/db.php";


// ===============================
// Check Method
// ===============================

if (
    $_SERVER['REQUEST_METHOD'] !== 'DELETE' &&
    $_SERVER['REQUEST_METHOD'] !== 'POST'
) {
    echo json_encode([
        "success" => false,
        "message" => "Only DELETE or POST method is allowed."
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
// Supabase URL
// ===============================

$url = $supabaseUrl . "/rest/v1/food_items?id=eq." . (int)$id;


// ===============================
// Delete Food
// ===============================

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");

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
        "message" => $errorData['message'] ?? "Unable to delete food.",
        "error" => $response
    ]);

    exit;
}


// ===============================
// Success
// ===============================

echo json_encode([
    "success" => true,
    "message" => "Food deleted successfully."
]);

?>