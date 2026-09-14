<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, PATCH, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once "../../config/db.php";

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

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;
$name = trim($data['name'] ?? '');
$image = trim($data['image'] ?? '');


// Validation

if (!$id) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Category ID is required."
    ]);

    exit;
}

if ($name === '') {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Category name is required."
    ]);

    exit;
}

if ($image === '') {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Category image is required."
    ]);

    exit;
}


// Category data

$categoryData = [
    "name" => $name,
    "image" => $image
];


// Supabase URL

$url = $supabaseUrl .
    "/rest/v1/categories?id=eq." .
    (int)$id;


// cURL

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");

curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($categoryData));

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

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
        "message" => "Unable to update category.",
        "error" => json_decode($response, true)
    ]);

    exit;
}


// Success

echo json_encode([
    "success" => true,
    "message" => "Category updated successfully.",
    "category" => json_decode($response, true)
]);

?>