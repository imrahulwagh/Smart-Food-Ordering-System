<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Only GET request is allowed"
    ]);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

/*
|--------------------------------------------------------------------------
| SEARCH VALUE
|--------------------------------------------------------------------------
*/

$search = isset($_GET['search'])
    ? trim($_GET['search'])
    : '';

/*
|--------------------------------------------------------------------------
| SUPABASE URL
|--------------------------------------------------------------------------
*/

$url = $supabaseUrl . "/rest/v1/food_items";

/*
|--------------------------------------------------------------------------
| QUERY
|--------------------------------------------------------------------------
*/

$query = [
    "select" => "*",
    "order" => "id.asc"
];

if ($search !== '') {
    $query["name"] = "ilike.*" . $search . "*";
}

$url .= "?" . http_build_query($query);

/*
|--------------------------------------------------------------------------
| SUPABASE HEADERS
|--------------------------------------------------------------------------
*/

$headers = [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json"
];

/*
|--------------------------------------------------------------------------
| CURL REQUEST
|--------------------------------------------------------------------------
*/

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);

if ($response === false) {
    $error = curl_error($ch);
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Supabase connection error",
        "details" => $error
    ]);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

$result = json_decode($response, true);

if ($httpCode < 200 || $httpCode >= 300) {
    http_response_code($httpCode);
    echo json_encode([
        "success" => false,
        "message" => "Could not fetch food items",
        "http_code" => $httpCode,
        "details" => $result,
        "raw_response" => $response,
        "request_url" => $url   // debug: check this matches what you tested in Postman
    ]);
    exit;
}

if (!is_array($result)) {
    $result = [];
}

echo json_encode([
    "success" => true,
    "search" => $search,
    "count" => count($result),
    "foods" => $result
]);