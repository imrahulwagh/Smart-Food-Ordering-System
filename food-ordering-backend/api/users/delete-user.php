<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once "../../config/db.php";


// Only DELETE / POST allowed

if (
    $_SERVER['REQUEST_METHOD'] !== 'DELETE' &&
    $_SERVER['REQUEST_METHOD'] !== 'POST'
) {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only DELETE or POST method is allowed."
    ]);

    exit;
}


// Read JSON body

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;


// Validate ID

if (!$id) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "User ID is required."
    ]);

    exit;
}


// profiles table URL
// id is UUID, so do not convert it to integer.

$url = $supabaseUrl .
       "/rest/v1/profiles?id=eq." .
       urlencode($id);


// Delete user profile

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json",
    "Prefer: return=representation"
]);


$response = curl_exec($ch);

$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

$curlError = curl_error($ch);

curl_close($ch);


// cURL error

if ($curlError) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "cURL Error.",
        "error" => $curlError
    ]);

    exit;
}


// Supabase error

if ($httpCode < 200 || $httpCode >= 300) {

    http_response_code($httpCode);

    echo json_encode([
        "success" => false,
        "message" => "Unable to delete user.",
        "error" => json_decode($response, true)
    ]);

    exit;
}


// Success

echo json_encode([
    "success" => true,
    "message" => "User deleted successfully."
]);

?>