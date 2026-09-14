<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


// =====================================================
// OPTIONS REQUEST
// =====================================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;
}


// =====================================================
// ONLY GET REQUEST
// =====================================================

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only GET request is allowed"
    ]);

    exit;
}


// =====================================================
// DATABASE CONFIG
// =====================================================

require_once __DIR__ . '/../../config/db.php';


// =====================================================
// GET USER ID
// =====================================================

$userId = $_GET['user_id'] ?? '';

$userId = trim($userId);


// =====================================================
// USER ID CHECK
// =====================================================

if (empty($userId)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "user_id is required"
    ]);

    exit;
}


// =====================================================
// SUPABASE PROFILE URL
// =====================================================

$url =
    $supabaseUrl .
    "/rest/v1/profiles" .
    "?id=eq." .
    urlencode($userId) .
    "&select=id,full_name,phone,email";


// =====================================================
// SUPABASE HEADERS
// =====================================================

$headers = [

    "apikey: " . $supabaseSecretKey,

    "Authorization: Bearer " . $supabaseSecretKey,

    "Content-Type: application/json"

];


// =====================================================
// CURL START
// =====================================================

$ch = curl_init($url);


curl_setopt(
    $ch,
    CURLOPT_RETURNTRANSFER,
    true
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
    30
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
// HTTP STATUS
// =====================================================

$httpCode =
    curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );


curl_close($ch);


// =====================================================
// DECODE RESPONSE
// =====================================================

$result =
    json_decode(
        $response,
        true
    );


// =====================================================
// SUPABASE ERROR
// =====================================================

if (
    $httpCode < 200 ||
    $httpCode >= 300
) {

    http_response_code($httpCode);

    echo json_encode([
        "success" => false,
        "message" => "Could not fetch profile",
        "details" => $result
    ]);

    exit;
}


// =====================================================
// PROFILE NOT FOUND
// =====================================================

if (
    !is_array($result) ||
    count($result) === 0
) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Profile not found",
        "user_id" => $userId
    ]);

    exit;
}


// =====================================================
// PROFILE FOUND
// =====================================================

$profile = $result[0];


// =====================================================
// SUCCESS RESPONSE
// =====================================================

echo json_encode([

    "success" => true,

    "message" => "Profile fetched successfully",

    "profile" => [

        "id" =>
            $profile['id'] ?? null,

        "full_name" =>
            $profile['full_name'] ?? '',

        "email" =>
            $profile['email'] ?? '',

        "phone" =>
            $profile['phone'] ?? ''

    ]

]);

?>