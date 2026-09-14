<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once "../../config/db.php";


// Only GET allowed

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only GET method is allowed."
    ]);

    exit;
}


// Supabase profiles table

$url = $supabaseUrl .
       "/rest/v1/profiles" .
       "?select=id,full_name,phone,email,created_at,photo" .
       "&order=created_at.desc";


// cURL request

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json"
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
        "message" => "Unable to fetch users.",
        "error" => json_decode($response, true)
    ]);

    exit;
}


// Decode response

$users = json_decode($response, true);


// Success

echo json_encode([
    "success" => true,
    "message" => "Users fetched successfully.",
    "users" => is_array($users) ? $users : []
]);

?>