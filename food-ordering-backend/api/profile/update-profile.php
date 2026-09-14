<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


// =====================================================
// OPTIONS
// =====================================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);
    exit;
}


// =====================================================
// REQUEST METHOD
// =====================================================

if (
    $_SERVER['REQUEST_METHOD'] !== 'PUT' &&
    $_SERVER['REQUEST_METHOD'] !== 'POST'
) {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only PUT or POST request is allowed"
    ]);

    exit;
}


// =====================================================
// DATABASE CONFIG
// =====================================================

require_once __DIR__ . '/../../config/db.php';


// =====================================================
// GET JSON DATA
// =====================================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);


if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data"
    ]);

    exit;
}


// =====================================================
// GET DATA
// =====================================================

$userId =
    trim($data['user_id'] ?? '');

$fullName =
    trim($data['full_name'] ?? '');

$phone =
    trim($data['phone'] ?? '');


// =====================================================
// VALIDATION
// =====================================================

if (empty($userId)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "user_id is required"
    ]);

    exit;
}


if (empty($fullName)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Full name is required"
    ]);

    exit;
}


if (empty($phone)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Phone number is required"
    ]);

    exit;
}


// =====================================================
// PHONE VALIDATION
// =====================================================

if (!preg_match('/^[0-9]{10}$/', $phone)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Phone number must contain exactly 10 digits"
    ]);

    exit;
}


// =====================================================
// SUPABASE URL
// =====================================================

$url =
    $supabaseUrl .
    "/rest/v1/profiles" .
    "?id=eq." .
    urlencode($userId);


// =====================================================
// SUPABASE HEADERS
// =====================================================

$headers = [

    "apikey: " . $supabaseSecretKey,

    "Authorization: Bearer " . $supabaseSecretKey,

    "Content-Type: application/json",

    // We don't need Supabase to return the whole record
    "Prefer: return=minimal"

];


// =====================================================
// UPDATE DATA
// =====================================================

$updateData = [

    "full_name" => $fullName,

    "phone" => $phone

];


// =====================================================
// CURL
// =====================================================

$ch = curl_init($url);

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
    CURLOPT_POSTFIELDS,
    json_encode($updateData)
);

curl_setopt(
    $ch,
    CURLOPT_HTTPHEADER,
    $headers
);

curl_setopt(
    $ch,
    CURLOPT_CONNECTTIMEOUT,
    10
);

curl_setopt(
    $ch,
    CURLOPT_TIMEOUT,
    15
);


// =====================================================
// SEND REQUEST
// =====================================================

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
// HTTP CODE
// =====================================================

$httpCode =
    curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );

curl_close($ch);


// =====================================================
// SUPABASE ERROR
// =====================================================

if (
    $httpCode < 200 ||
    $httpCode >= 300
) {

    http_response_code($httpCode);

    $result =
        json_decode(
            $response,
            true
        );

    echo json_encode([
        "success" => false,
        "message" => "Could not update profile",
        "details" => $result
    ]);

    exit;
}


// =====================================================
// SUCCESS
// =====================================================

echo json_encode([

    "success" => true,

    "message" =>
        "Profile updated successfully",

    "profile" => [

        "id" =>
            $userId,

        "full_name" =>
            $fullName,

        "phone" =>
            $phone

    ]

]);

?>