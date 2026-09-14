<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once "../../config/db.php";

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
        "message" => "Category ID is required."
    ]);

    exit;
}


// --------------------------------------------------
// Check whether foods are using this category
// --------------------------------------------------

$foodCheckUrl =
    $supabaseUrl .
    "/rest/v1/food_items?category_id=eq." .
    (int)$id .
    "&select=id,name";

$ch = curl_init($foodCheckUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json"
]);

$foodResponse = curl_exec($ch);

$foodHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

$foodCurlError = curl_error($ch);

curl_close($ch);


// cURL error

if ($foodCurlError) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to check category foods.",
        "error" => $foodCurlError
    ]);

    exit;
}


// Supabase error while checking foods

if ($foodHttpCode < 200 || $foodHttpCode >= 300) {

    http_response_code($foodHttpCode);

    echo json_encode([
        "success" => false,
        "message" => "Unable to check category foods.",
        "error" => json_decode($foodResponse, true)
    ]);

    exit;
}


$foods = json_decode($foodResponse, true);


// --------------------------------------------------
// Do not delete if foods exist
// --------------------------------------------------

if (is_array($foods) && count($foods) > 0) {

    $foodNames = [];

    foreach ($foods as $food) {
        if (!empty($food['name'])) {
            $foodNames[] = $food['name'];
        }
    }

    http_response_code(409);

    echo json_encode([
        "success" => false,
        "message" => "Cannot delete this category because food items are using it.",
        "food_count" => count($foods),
        "foods" => $foodNames
    ]);

    exit;
}


// --------------------------------------------------
// Delete category
// --------------------------------------------------

$url =
    $supabaseUrl .
    "/rest/v1/categories?id=eq." .
    (int)$id;


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
        "message" => "Unable to delete category.",
        "error" => json_decode($response, true)
    ]);

    exit;
}


// Success

echo json_encode([
    "success" => true,
    "message" => "Category deleted successfully."
]);

?>