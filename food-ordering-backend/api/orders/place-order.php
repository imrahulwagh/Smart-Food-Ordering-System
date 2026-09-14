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


/*
|--------------------------------------------------------------------------
| GET INPUT
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| REQUIRED DATA
|--------------------------------------------------------------------------
*/

if (
    empty($data['user_id']) ||
    empty($data['address']) ||
    empty($data['phone']) ||
    empty($data['payment_method'])
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "user_id, address, phone and payment_method are required"
    ]);

    exit;
}


$userId = trim($data['user_id']);
$address = trim($data['address']);
$phone = trim($data['phone']);
$paymentMethod = trim($data['payment_method']);


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
| 1. GET USER CART
|--------------------------------------------------------------------------
*/

$cartUrl =
    $supabaseUrl .
    "/rest/v1/cart_items" .
    "?user_id=eq." . urlencode($userId) .
    "&select=id,user_id,food_id,quantity,price";


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
        "message" => "Cart request failed",
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


/*
|--------------------------------------------------------------------------
| CART CHECK
|--------------------------------------------------------------------------
*/

if ($cartHttpCode < 200 || $cartHttpCode >= 300) {

    http_response_code($cartHttpCode);

    echo json_encode([
        "success" => false,
        "message" => "Could not fetch cart",
        "details" => $cartResult
    ]);

    exit;
}


if (!is_array($cartResult) || count($cartResult) === 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Cart is empty"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| 2. CALCULATE TOTAL
|--------------------------------------------------------------------------
*/

$totalAmount = 0;

foreach ($cartResult as $item) {

    $price = (float)$item['price'];
    $quantity = (int)$item['quantity'];

    $totalAmount += $price * $quantity;
}


/*
|--------------------------------------------------------------------------
| 3. CREATE ORDER
|--------------------------------------------------------------------------
*/

$orderUrl =
    $supabaseUrl .
    "/rest/v1/orders";


$orderBody = json_encode([

    "user_id" => $userId,

    "total_amount" => $totalAmount,

    "address" => $address,

    "phone" => $phone,

    "payment_method" => $paymentMethod,

    "order_status" => "Pending",

    "status" => "Pending"

]);


$orderHeaders = [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json",
    "Prefer: return=representation"
];


$ch = curl_init($orderUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $orderBody);
curl_setopt($ch, CURLOPT_HTTPHEADER, $orderHeaders);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$orderResponse = curl_exec($ch);

if ($orderResponse === false) {

    $error = curl_error($ch);

    curl_close($ch);

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Order request failed",
        "details" => $error
    ]);

    exit;
}

$orderHttpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);

$orderResult = json_decode(
    $orderResponse,
    true
);


/*
|--------------------------------------------------------------------------
| ORDER CHECK
|--------------------------------------------------------------------------
*/

if ($orderHttpCode < 200 || $orderHttpCode >= 300) {

    http_response_code($orderHttpCode);

    echo json_encode([
        "success" => false,
        "message" => "Order creation failed",
        "details" => $orderResult,
        "sent_data" => [
            "user_id" => $userId,
            "total_amount" => $totalAmount,
            "address" => $address,
            "phone" => $phone,
            "payment_method" => $paymentMethod
        ]
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| GET ORDER ID
|--------------------------------------------------------------------------
*/

if (
    !is_array($orderResult) ||
    count($orderResult) === 0 ||
    !isset($orderResult[0]['id'])
) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Order created but order ID was not received",
        "details" => $orderResult
    ]);

    exit;
}


$order = $orderResult[0];

$orderId = $order['id'];


/*
|--------------------------------------------------------------------------
| 4. INSERT ORDER ITEMS
|--------------------------------------------------------------------------
*/

foreach ($cartResult as $item) {

    $orderItemUrl =
        $supabaseUrl .
        "/rest/v1/order_items";


    $orderItemBody = json_encode([

        "order_id" => $orderId,

        "food_id" => (int)$item['food_id'],

        "quantity" => (int)$item['quantity'],

        "price" => (float)$item['price']

    ]);


    $orderItemHeaders = [
        "apikey: " . $supabaseSecretKey,
        "Authorization: Bearer " . $supabaseSecretKey,
        "Content-Type: application/json"
    ];


    $ch = curl_init($orderItemUrl);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $orderItemBody);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $orderItemHeaders);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $itemResponse = curl_exec($ch);

    $itemHttpCode = curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );

    curl_close($ch);


    if (
        $itemResponse === false ||
        $itemHttpCode < 200 ||
        $itemHttpCode >= 300
    ) {

        echo json_encode([
            "success" => false,
            "message" => "Order created but order item could not be saved",
            "order_id" => $orderId,
            "details" => json_decode($itemResponse, true)
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| 5. CLEAR CART
|--------------------------------------------------------------------------
*/

$deleteCartUrl =
    $supabaseUrl .
    "/rest/v1/cart_items" .
    "?user_id=eq." . urlencode($userId);


$deleteHeaders = [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json"
];


$ch = curl_init($deleteCartUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_setopt($ch, CURLOPT_HTTPHEADER, $deleteHeaders);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$deleteResponse = curl_exec($ch);

$deleteHttpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);


/*
|--------------------------------------------------------------------------
| FINAL RESPONSE
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "message" => "Order placed successfully",

    "order" => [

        "id" => $orderId,

        "user_id" => $userId,

        "total_amount" => $totalAmount,

        "address" => $address,

        "phone" => $phone,

        "payment_method" => $paymentMethod,

        "order_status" => "Pending",

        "status" => "Pending"

    ],

    "cart_cleared" =>
        ($deleteHttpCode >= 200 && $deleteHttpCode < 300)

]);

?>