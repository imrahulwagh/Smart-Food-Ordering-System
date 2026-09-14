<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST request is allowed"
    ]);

    exit;
}


require_once __DIR__ . '/../../config/db.php';


// =====================================================
// COMMON SUPABASE HEADERS
// =====================================================

$headers = [

    "apikey: " . $supabaseSecretKey,

    "Authorization: Bearer " . $supabaseSecretKey,

    "Content-Type: application/json"

];


// =====================================================
// GET JSON DATA
// =====================================================

$input = file_get_contents("php://input");

$data = json_decode($input, true);


if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data"
    ]);

    exit;
}


// =====================================================
// CHECK REQUIRED DATA
// =====================================================

if (
    empty($data['user_id']) ||
    empty($data['food_id'])
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "user_id and food_id are required"
    ]);

    exit;
}


// =====================================================
// GET VALUES
// =====================================================

$userId = trim($data['user_id']);

$foodId = (int)$data['food_id'];

$quantity = isset($data['quantity'])
    ? (int)$data['quantity']
    : 1;


if ($quantity <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Quantity must be greater than 0"
    ]);

    exit;
}


// =====================================================
// 1. CHECK FOOD ITEM
// =====================================================

$foodUrl =
    $supabaseUrl .
    "/rest/v1/food_items" .
    "?id=eq." . $foodId .
    "&select=id,name,price,image,s_available";


$ch = curl_init($foodUrl);


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


$foodResponse = curl_exec($ch);


if ($foodResponse === false) {

    $error = curl_error($ch);

    curl_close($ch);

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Food request failed",
        "details" => $error
    ]);

    exit;
}


$foodHttpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);


curl_close($ch);


$foodResult = json_decode(
    $foodResponse,
    true
);


// =====================================================
// FOOD REQUEST ERROR
// =====================================================

if (
    $foodHttpCode < 200 ||
    $foodHttpCode >= 300
) {

    http_response_code($foodHttpCode);

    echo json_encode([
        "success" => false,
        "message" => "Supabase food request failed",
        "http_code" => $foodHttpCode,
        "details" => $foodResult,
        "raw_response" => $foodResponse
    ]);

    exit;
}


// =====================================================
// FOOD NOT FOUND
// =====================================================

if (
    !is_array($foodResult) ||
    count($foodResult) === 0
) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Food item not found",
        "food_id" => $foodId
    ]);

    exit;
}


$food = $foodResult[0];


// =====================================================
// CHECK FOOD AVAILABILITY
// =====================================================

if (
    isset($food['s_available']) &&
    $food['s_available'] === false
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Food is currently unavailable"
    ]);

    exit;
}


// =====================================================
// 2. CHECK EXISTING CART ITEM
// =====================================================

$cartCheckUrl =
    $supabaseUrl .
    "/rest/v1/cart_items" .
    "?user_id=eq." . urlencode($userId) .
    "&food_id=eq." . $foodId .
    "&select=id,user_id,food_id,quantity,price";


$ch = curl_init($cartCheckUrl);


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


$cartCheckResponse = curl_exec($ch);


if ($cartCheckResponse === false) {

    $error = curl_error($ch);

    curl_close($ch);

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Cart check failed",
        "details" => $error
    ]);

    exit;
}


$cartCheckHttpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);


curl_close($ch);


$cartCheckResult = json_decode(
    $cartCheckResponse,
    true
);


// =====================================================
// CART CHECK ERROR
// =====================================================

if (
    $cartCheckHttpCode < 200 ||
    $cartCheckHttpCode >= 300
) {

    http_response_code($cartCheckHttpCode);

    echo json_encode([
        "success" => false,
        "message" => "Could not check cart",
        "http_code" => $cartCheckHttpCode,
        "details" => $cartCheckResult,
        "raw_response" => $cartCheckResponse
    ]);

    exit;
}


// =====================================================
// 3. IF ITEM ALREADY EXISTS → UPDATE QUANTITY
// =====================================================

if (
    is_array($cartCheckResult) &&
    count($cartCheckResult) > 0
) {

    $cartItem = $cartCheckResult[0];

    $cartId = $cartItem['id'];

    $oldQuantity = (int)$cartItem['quantity'];

    $newQuantity = $oldQuantity + $quantity;


    $updateUrl =
        $supabaseUrl .
        "/rest/v1/cart_items" .
        "?id=eq." . urlencode($cartId);


    $updateBody = json_encode([

        "quantity" => $newQuantity,

        "price" => $food['price']

    ]);


    $updateHeaders = [

        "apikey: " . $supabaseSecretKey,

        "Authorization: Bearer " . $supabaseSecretKey,

        "Content-Type: application/json",

        "Prefer: return=representation"

    ];


    $ch = curl_init($updateUrl);


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
        $updateBody
    );


    curl_setopt(
        $ch,
        CURLOPT_HTTPHEADER,
        $updateHeaders
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


    $updateResponse = curl_exec($ch);


    if ($updateResponse === false) {

        $error = curl_error($ch);

        curl_close($ch);

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Could not update cart",
            "details" => $error
        ]);

        exit;
    }


    $updateHttpCode = curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );


    curl_close($ch);


    $updateResult = json_decode(
        $updateResponse,
        true
    );


    if (
        $updateHttpCode >= 200 &&
        $updateHttpCode < 300
    ) {

        echo json_encode([

            "success" => true,

            "message" => "Cart quantity updated",

            "cart_item" => [

                "id" => $cartId,

                "user_id" => $userId,

                "food_id" => $foodId,

                "food_name" => $food['name'],

                "quantity" => $newQuantity,

                "price" => $food['price'],

                "image" => $food['image']

            ]

        ]);

        exit;
    }


    http_response_code($updateHttpCode);

    echo json_encode([

        "success" => false,

        "message" => "Cart update failed",

        "details" => $updateResult

    ]);

    exit;
}


// =====================================================
// 4. ADD NEW ITEM TO CART
// =====================================================

$cartUrl =
    $supabaseUrl .
    "/rest/v1/cart_items";


$cartBody = json_encode([

    "user_id" => $userId,

    "food_id" => $foodId,

    "quantity" => $quantity,

    "price" => $food['price']

]);


$cartHeaders = [

    "apikey: " . $supabaseSecretKey,

    "Authorization: Bearer " . $supabaseSecretKey,

    "Content-Type: application/json",

    "Prefer: return=representation"

];


$ch = curl_init($cartUrl);


curl_setopt(
    $ch,
    CURLOPT_RETURNTRANSFER,
    true
);


curl_setopt(
    $ch,
    CURLOPT_POST,
    true
);


curl_setopt(
    $ch,
    CURLOPT_POSTFIELDS,
    $cartBody
);


curl_setopt(
    $ch,
    CURLOPT_HTTPHEADER,
    $cartHeaders
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


$cartResponse = curl_exec($ch);


if ($cartResponse === false) {

    $error = curl_error($ch);

    curl_close($ch);

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" => "Could not add item to cart",

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
// 5. CART INSERT SUCCESS
// =====================================================

if (
    $cartHttpCode >= 200 &&
    $cartHttpCode < 300
) {

    echo json_encode([

        "success" => true,

        "message" => "Food added to cart successfully",

        "cart_item" => [

            "user_id" => $userId,

            "food_id" => $foodId,

            "food_name" => $food['name'],

            "quantity" => $quantity,

            "price" => $food['price'],

            "image" => $food['image']

        ]

    ]);

    exit;
}


// =====================================================
// CART INSERT FAILED
// =====================================================

http_response_code($cartHttpCode);

echo json_encode([

    "success" => false,

    "message" => "Failed to add food to cart",

    "http_code" => $cartHttpCode,

    "details" => $cartResult,

    "raw_response" => $cartResponse

]);

?>