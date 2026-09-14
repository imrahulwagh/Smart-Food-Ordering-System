<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';


// =====================================================
// GET USER ID
// =====================================================

$userId = null;


// GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    if (isset($_GET['user_id'])) {
        $userId = trim($_GET['user_id']);
    }
}


// POST request
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $input = file_get_contents("php://input");

    $data = json_decode($input, true);

    if (is_array($data) && isset($data['user_id'])) {
        $userId = trim($data['user_id']);
    }
}


// =====================================================
// CHECK USER ID
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
// SUPABASE HEADERS
// =====================================================

$headers = [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json"
];


// =====================================================
// GET CART ITEMS
// =====================================================

$cartUrl =
    $supabaseUrl .
    "/rest/v1/cart_items" .
    "?user_id=eq." . urlencode($userId) .
    "&select=id,user_id,food_id,quantity";


$ch = curl_init($cartUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$cartResponse = curl_exec($ch);


if ($cartResponse === false) {

    $error = curl_error($ch);

    curl_close($ch);

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Could not fetch cart",
        "details" => $error
    ]);

    exit;
}


$cartHttpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);


$cartResult = json_decode(
    $cartResponse,
    true
);


// =====================================================
// CHECK CART RESPONSE
// =====================================================

if ($cartHttpCode < 200 || $cartHttpCode >= 300) {

    http_response_code($cartHttpCode);

    echo json_encode([
        "success" => false,
        "message" => "Could not fetch cart",
        "details" => $cartResult
    ]);

    exit;
}


// =====================================================
// EMPTY CART
// =====================================================

if (!is_array($cartResult) || count($cartResult) === 0) {

    echo json_encode([
        "success" => true,
        "message" => "Cart is empty",
        "cart" => [],
        "cart_total" => 0
    ]);

    exit;
}


// =====================================================
// PREPARE CART
// =====================================================

$cart = [];

$cartTotal = 0;


// =====================================================
// GET FOOD DETAILS FOR EACH CART ITEM
// =====================================================

foreach ($cartResult as $item) {

    $foodId = (int)$item['food_id'];

    $quantity = (int)$item['quantity'];


    // -----------------------------------------------
    // GET FOOD
    // -----------------------------------------------

    $foodUrl =
        $supabaseUrl .
        "/rest/v1/food_items" .
        "?id=eq." . $foodId .
        "&select=id,name,price,image";


    $foodCh = curl_init($foodUrl);

    curl_setopt(
        $foodCh,
        CURLOPT_RETURNTRANSFER,
        true
    );

    curl_setopt(
        $foodCh,
        CURLOPT_HTTPHEADER,
        $headers
    );

    curl_setopt(
        $foodCh,
        CURLOPT_CONNECTTIMEOUT,
        10
    );

    curl_setopt(
        $foodCh,
        CURLOPT_TIMEOUT,
        30
    );


    $foodResponse = curl_exec($foodCh);


    if ($foodResponse === false) {

        curl_close($foodCh);

        continue;
    }


    $foodHttpCode = curl_getinfo(
        $foodCh,
        CURLINFO_HTTP_CODE
    );

    curl_close($foodCh);


    if (
        $foodHttpCode < 200 ||
        $foodHttpCode >= 300
    ) {
        continue;
    }


    $foodResult = json_decode(
        $foodResponse,
        true
    );


    if (
        !is_array($foodResult) ||
        count($foodResult) === 0
    ) {
        continue;
    }


    $food = $foodResult[0];


    // -----------------------------------------------
    // PRICE
    // -----------------------------------------------

    $price = (float)$food['price'];


    // -----------------------------------------------
    // ITEM TOTAL
    // -----------------------------------------------

    $itemTotal = $price * $quantity;


    // -----------------------------------------------
    // ADD TO CART RESPONSE
    // -----------------------------------------------

    $cart[] = [

        "cart_id" => $item['id'],

        "user_id" => $item['user_id'],

        "food_id" => $foodId,

        "name" => $food['name'],

        "price" => $price,

        "quantity" => $quantity,

        "image" => $food['image'],

        "item_total" => $itemTotal

    ];


    // -----------------------------------------------
    // ADD TO CART TOTAL
    // -----------------------------------------------

    $cartTotal += $itemTotal;
}


// =====================================================
// FINAL RESPONSE
// =====================================================

echo json_encode([

    "success" => true,

    "message" => "Cart fetched successfully",

    "cart" => $cart,

    "cart_total" => $cartTotal

]);

?>