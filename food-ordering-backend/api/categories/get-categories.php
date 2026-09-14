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
| 1. Get Categories
|--------------------------------------------------------------------------
*/

$categoryUrl = $supabaseUrl . "/rest/v1/categories";

$categoryQuery = [
    "select" => "id,name,image,created_at",
    "order" => "id.asc"
];

$categoryUrl .= "?" . http_build_query($categoryQuery);


/*
|--------------------------------------------------------------------------
| 2. Get Food Items
|--------------------------------------------------------------------------
*/

$foodUrl = $supabaseUrl . "/rest/v1/food_items";

$foodQuery = [
    "select" => "id,category_id"
];

$foodUrl .= "?" . http_build_query($foodQuery);


/*
|--------------------------------------------------------------------------
| Supabase Headers
|--------------------------------------------------------------------------
*/

$headers = [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json"
];


/*
|--------------------------------------------------------------------------
| Get Categories From Supabase
|--------------------------------------------------------------------------
*/

$ch = curl_init($categoryUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$categoryResponse = curl_exec($ch);

if ($categoryResponse === false) {

    $error = curl_error($ch);

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Category API connection error",
        "details" => $error
    ]);

    exit;
}

$categoryHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);


$categories = json_decode($categoryResponse, true);


/*
|--------------------------------------------------------------------------
| Check Category Response
|--------------------------------------------------------------------------
*/

if ($categoryHttpCode < 200 || $categoryHttpCode >= 300) {

    http_response_code($categoryHttpCode);

    echo json_encode([
        "success" => false,
        "message" => "Could not fetch categories",
        "http_code" => $categoryHttpCode,
        "details" => $categories
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Get Food Items From Supabase
|--------------------------------------------------------------------------
*/

$ch = curl_init($foodUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$foodResponse = curl_exec($ch);

if ($foodResponse === false) {

    $error = curl_error($ch);

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Food API connection error",
        "details" => $error
    ]);

    exit;
}

$foodHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);


$foods = json_decode($foodResponse, true);


/*
|--------------------------------------------------------------------------
| Check Food Response
|--------------------------------------------------------------------------
*/

if ($foodHttpCode < 200 || $foodHttpCode >= 300) {

    http_response_code($foodHttpCode);

    echo json_encode([
        "success" => false,
        "message" => "Could not fetch food items",
        "http_code" => $foodHttpCode,
        "details" => $foods
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| 3. Count Food Items Category-wise
|--------------------------------------------------------------------------
*/

$categoryCounts = [];

foreach ($foods as $food) {

    $categoryId = $food['category_id'];

    if (!isset($categoryCounts[$categoryId])) {
        $categoryCounts[$categoryId] = 0;
    }

    $categoryCounts[$categoryId]++;
}


/*
|--------------------------------------------------------------------------
| 4. Add Count To Every Category
|--------------------------------------------------------------------------
*/

foreach ($categories as &$category) {

    $categoryId = $category['id'];

    $category['count'] = $categoryCounts[$categoryId] ?? 0;
}

unset($category);


/*
|--------------------------------------------------------------------------
| 5. Final Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "count" => count($categories),
    "categories" => $categories
]);

?>