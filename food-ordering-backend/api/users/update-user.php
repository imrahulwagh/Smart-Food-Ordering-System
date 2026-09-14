<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, PATCH, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once "../../config/db.php";


// Only PUT / PATCH / POST allowed

if (
    $_SERVER['REQUEST_METHOD'] !== 'PUT' &&
    $_SERVER['REQUEST_METHOD'] !== 'PATCH' &&
    $_SERVER['REQUEST_METHOD'] !== 'POST'
) {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only PUT, PATCH or POST method is allowed."
    ]);

    exit;
}


// Read JSON body

$data = json_decode(file_get_contents("php://input"), true);


// Get values

$id = $data['id'] ?? null;
$full_name = trim($data['full_name'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$photo = trim($data['photo'] ?? '');


// Validation

if (!$id) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "User ID is required."
    ]);

    exit;
}

if ($full_name === '') {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Full name is required."
    ]);

    exit;
}

if ($email === '') {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Email is required."
    ]);

    exit;
}


// User data

$userData = [
    "full_name" => $full_name,
    "phone" => $phone,
    "email" => $email,
    "photo" => $photo
];


// Supabase URL
// profiles.id is UUID, so DO NOT cast it to integer.

$url = $supabaseUrl .
       "/rest/v1/profiles?id=eq." .
       urlencode($id);


// cURL PATCH

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");

curl_setopt(
    $ch,
    CURLOPT_POSTFIELDS,
    json_encode($userData)
);

curl_setopt(
    $ch,
    CURLOPT_RETURNTRANSFER,
    true
);

curl_setopt(
    $ch,
    CURLOPT_HTTPHEADER,
    [
        "apikey: " . $supabaseSecretKey,
        "Authorization: Bearer " . $supabaseSecretKey,
        "Content-Type: application/json",
        "Prefer: return=representation"
    ]
);


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
        "message" => "Unable to update user.",
        "error" => json_decode($response, true)
    ]);

    exit;
}


// Success

echo json_encode([
    "success" => true,
    "message" => "User updated successfully.",
    "user" => json_decode($response, true)
]);

?>