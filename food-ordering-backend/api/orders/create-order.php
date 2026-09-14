<?php

// =====================================================
// RESPONSE HEADER
// =====================================================

header("Content-Type: application/json");

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Methods: POST, OPTIONS");

header("Access-Control-Allow-Headers: Content-Type, Authorization");


// =====================================================
// OPTIONS REQUEST
// =====================================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;
}


// =====================================================
// ONLY POST REQUEST
// =====================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST request is allowed"
    ]);

    exit;
}


// =====================================================
// DATABASE CONFIG
// =====================================================

require_once __DIR__ . '/../../config/db.php';


// =====================================================
// READ JSON DATA
// =====================================================

$input = file_get_contents("php://input");

$data = json_decode(
    $input,
    true
);


// =====================================================
// CHECK JSON
// =====================================================

if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data"
    ]);

    exit;
}


// =====================================================
// GET USER ID
// =====================================================

$userId = trim(
    $data['user_id'] ?? ''
);


// =====================================================
// GET ADDRESS
// =====================================================

$address = trim(
    $data['address'] ?? ''
);


// =====================================================
// GET PHONE
// =====================================================

$phone = trim(
    $data['phone'] ?? ''
);


// =====================================================
// GET PAYMENT METHOD
// =====================================================

$paymentMethod = strtoupper(
    trim(
        $data['payment_method'] ?? ''
    )
);


// =====================================================
// USER ID VALIDATION
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
// ADDRESS VALIDATION
// =====================================================

if (empty($address)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Delivery address is required"
    ]);

    exit;
}


// =====================================================
// PHONE VALIDATION
// =====================================================

if (empty($phone)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Phone number is required"
    ]);

    exit;
}


if (!preg_match('/^[0-9]{10}$/', $phone)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Phone number must contain exactly 10 digits"
    ]);

    exit;
}


// =====================================================
// PAYMENT METHOD VALIDATION
// =====================================================

if (
    $paymentMethod !== 'COD' &&
    $paymentMethod !== 'ONLINE'
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Payment method must be COD or ONLINE"
    ]);

    exit;
}


// =====================================================
// SUPABASE HEADERS
// =====================================================

$headers = [

    "apikey: " . $supabaseSecretKey,

    "Authorization: Bearer " .
        $supabaseSecretKey,

    "Content-Type: application/json",

    "Prefer: return=representation"

];


// =====================================================
// FUNCTION: SUPABASE GET
// =====================================================

function supabaseGet(
    $url,
    $headers
) {

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

    $response =
        curl_exec($ch);


    if ($response === false) {

        $error =
            curl_error($ch);

        curl_close($ch);

        return [

            "success" => false,

            "http_code" => 500,

            "error" => $error

        ];

    }


    $httpCode =
        curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );


    curl_close($ch);


    return [

        "success" => true,

        "http_code" => $httpCode,

        "data" =>
            json_decode(
                $response,
                true
            )

    ];

}


// =====================================================
// FUNCTION: SUPABASE POST
// =====================================================

function supabasePost(
    $url,
    $headers,
    $body
) {

    $ch = curl_init($url);


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
        json_encode($body)
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


    $response =
        curl_exec($ch);


    if ($response === false) {

        $error =
            curl_error($ch);

        curl_close($ch);


        return [

            "success" => false,

            "http_code" => 500,

            "error" => $error

        ];

    }


    $httpCode =
        curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );


    curl_close($ch);


    return [

        "success" => true,

        "http_code" => $httpCode,

        "data" =>
            json_decode(
                $response,
                true
            )

    ];

}


// =====================================================
// FUNCTION: SUPABASE DELETE
// =====================================================

function supabaseDelete(
    $url,
    $headers
) {

    $ch = curl_init($url);


    curl_setopt(
        $ch,
        CURLOPT_RETURNTRANSFER,
        true
    );


    curl_setopt(
        $ch,
        CURLOPT_CUSTOMREQUEST,
        "DELETE"
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


    $response =
        curl_exec($ch);


    if ($response === false) {

        $error =
            curl_error($ch);

        curl_close($ch);


        return [

            "success" => false,

            "http_code" => 500,

            "error" => $error

        ];

    }


    $httpCode =
        curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );


    curl_close($ch);


    return [

        "success" => true,

        "http_code" => $httpCode,

        "data" =>
            json_decode(
                $response,
                true
            )

    ];

}


// =====================================================
// 1. GET USER CART
// =====================================================

$cartUrl =

    $supabaseUrl .

    "/rest/v1/cart_items" .

    "?user_id=eq." .

    urlencode($userId) .

    "&select=id,user_id,food_id,quantity,price";


$cartResult = supabaseGet(

    $cartUrl,

    $headers

);


// =====================================================
// CART API ERROR
// =====================================================

if (
    !$cartResult['success']
) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Could not connect to Supabase",

        "details" =>
            $cartResult['error']

    ]);

    exit;
}


// =====================================================
// CHECK CART HTTP CODE
// =====================================================

if (
    $cartResult['http_code'] < 200 ||
    $cartResult['http_code'] >= 300
) {

    http_response_code(
        $cartResult['http_code']
    );

    echo json_encode([

        "success" => false,

        "message" =>
            "Could not fetch cart",

        "details" =>
            $cartResult['data']

    ]);

    exit;
}


$cartItems =
    $cartResult['data'];


// =====================================================
// CHECK EMPTY CART
// =====================================================

if (
    !is_array($cartItems) ||
    count($cartItems) === 0
) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "message" =>
            "Your cart is empty"

    ]);

    exit;
}


// =====================================================
// 2. FETCH ACTUAL FOOD DETAILS
// =====================================================

$orderItems = [];

$calculatedTotal = 0;


foreach (
    $cartItems as $cartItem
) {


    $foodId =
        $cartItem['food_id'] ?? null;


    $quantity =
        (int)(
            $cartItem['quantity'] ?? 0
        );


    // =================================================
    // INVALID QUANTITY
    // =================================================

    if (
        !$foodId ||
        $quantity <= 0
    ) {

        http_response_code(400);

        echo json_encode([

            "success" => false,

            "message" =>
                "Invalid cart item data"

        ]);

        exit;
    }


    // =================================================
    // FETCH FOOD FROM DATABASE
    // =================================================

    $foodUrl =

        $supabaseUrl .

        "/rest/v1/food_items" .

        "?id=eq." .

        urlencode($foodId) .

        "&select=id,name,price,s_available";


    $foodResult = supabaseGet(

        $foodUrl,

        $headers

    );


    // =================================================
    // FOOD API ERROR
    // =================================================

    if (
        !$foodResult['success']
    ) {

        http_response_code(500);

        echo json_encode([

            "success" => false,

            "message" =>
                "Could not fetch food details",

            "details" =>
                $foodResult['error']

        ]);

        exit;
    }


    // =================================================
    // FOOD HTTP ERROR
    // =================================================

    if (
        $foodResult['http_code'] < 200 ||
        $foodResult['http_code'] >= 300
    ) {

        http_response_code(
            $foodResult['http_code']
        );

        echo json_encode([

            "success" => false,

            "message" =>
                "Could not fetch food details",

            "details" =>
                $foodResult['data']

        ]);

        exit;
    }


    $foodData =
        $foodResult['data'];


    // =================================================
    // FOOD NOT FOUND
    // =================================================

    if (
        !is_array($foodData) ||
        count($foodData) === 0
    ) {

        http_response_code(400);

        echo json_encode([

            "success" => false,

            "message" =>
                "Food item not found",

            "food_id" =>
                $foodId

        ]);

        exit;
    }


    $food =
        $foodData[0];


    // =================================================
    // CHECK FOOD AVAILABILITY
    // =================================================

    if (
        isset($food['s_available']) &&
        $food['s_available'] === false
    ) {

        http_response_code(400);

        echo json_encode([

            "success" => false,

            "message" =>
                $food['name'] .
                " is currently unavailable"

        ]);

        exit;
    }


    // =================================================
    // ACTUAL DATABASE PRICE
    // =================================================

    $price =
        (float)(
            $food['price'] ?? 0
        );


    // =================================================
    // ITEM TOTAL
    // =================================================

    $itemTotal =
        $price * $quantity;


    // =================================================
    // ADD TO TOTAL
    // =================================================

    $calculatedTotal +=
        $itemTotal;


    // =================================================
    // PREPARE ORDER ITEM
    // =================================================

    $orderItems[] = [

        "food_id" =>
            (int)$foodId,

        "quantity" =>
            $quantity,

        "price" =>
            $price

    ];

}


// =====================================================
// ROUND TOTAL
// =====================================================

$calculatedTotal =
    round(
        $calculatedTotal,
        2
    );


// =====================================================
// 3. DELIVERY DATE
// =====================================================

// Current date

$orderDate =
    new DateTime();


// Delivery date = 2 days after order

$deliveryDate =
    clone $orderDate;

$deliveryDate->modify(
    '+2 days'
);


$deliveryDateString =
    $deliveryDate->format(
        'Y-m-d'
    );


// =====================================================
// 4. ORDER STATUS
// =====================================================

// COD order can be confirmed immediately.

$orderStatus =
    'CONFIRMED';


// =====================================================
// 5. PAYMENT STATUS
// =====================================================

// COD payment is received at delivery,
// so payment remains pending.

$paymentStatus =
    'PENDING';


// =====================================================
// 6. CREATE ORDER
// =====================================================

$orderData = [

    "user_id" =>
        $userId,

    "total_amount" =>
        $calculatedTotal,

    "address" =>
        $address,

    "phone" =>
        $phone,

    "payment_method" =>
        $paymentMethod,

    "payment_status" =>
        $paymentStatus,

    "order_status" =>
        $orderStatus,

    "delivery_date" =>
        $deliveryDateString

];


$orderUrl =
    $supabaseUrl .
    "/rest/v1/orders";


$orderResult = supabasePost(

    $orderUrl,

    $headers,

    $orderData

);


// =====================================================
// ORDER CREATION ERROR
// =====================================================

if (
    !$orderResult['success']
) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Could not create order",

        "details" =>
            $orderResult['error']

    ]);

    exit;
}


// =====================================================
// CHECK ORDER HTTP CODE
// =====================================================

if (
    $orderResult['http_code'] < 200 ||
    $orderResult['http_code'] >= 300
) {

    http_response_code(
        $orderResult['http_code']
    );

    echo json_encode([

        "success" => false,

        "message" =>
            "Could not create order",

        "details" =>
            $orderResult['data']

    ]);

    exit;
}


// =====================================================
// GET CREATED ORDER
// =====================================================

$createdOrderData =
    $orderResult['data'];


if (
    !is_array($createdOrderData) ||
    count($createdOrderData) === 0
) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Order was not created properly"

    ]);

    exit;
}


$createdOrder =
    $createdOrderData[0];


$orderId =
    $createdOrder['id'] ?? null;


// =====================================================
// CHECK ORDER ID
// =====================================================

if (!$orderId) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Order ID was not generated"

    ]);

    exit;
}


// =====================================================
// 7. CREATE ORDER ITEMS
// =====================================================

foreach (
    $orderItems as $orderItem
) {


    $orderItemData = [

        "order_id" =>
            (int)$orderId,

        "food_id" =>
            $orderItem['food_id'],

        "quantity" =>
            $orderItem['quantity'],

        "price" =>
            $orderItem['price']

    ];


    $orderItemUrl =

        $supabaseUrl .

        "/rest/v1/order_items";


    $itemResult =
        supabasePost(

            $orderItemUrl,

            $headers,

            $orderItemData

        );


    // =================================================
    // ORDER ITEM ERROR
    // =================================================

    if (
        !$itemResult['success'] ||
        $itemResult['http_code'] < 200 ||
        $itemResult['http_code'] >= 300
    ) {


        // =============================================
        // ROLLBACK ORDER
        // =============================================

        $deleteOrderUrl =

            $supabaseUrl .

            "/rest/v1/orders" .

            "?id=eq." .

            urlencode($orderId);


        supabaseDelete(

            $deleteOrderUrl,

            $headers

        );


        http_response_code(500);

        echo json_encode([

            "success" => false,

            "message" =>
                "Could not create order items",

            "details" =>
                $itemResult['data']
                    ?? $itemResult['error']
                    ?? null

        ]);

        exit;
    }

}


// =====================================================
// 8. DELETE CART ITEMS
// =====================================================

$deleteCartUrl =

    $supabaseUrl .

    "/rest/v1/cart_items" .

    "?user_id=eq." .

    urlencode($userId);


$deleteCartResult =
    supabaseDelete(

        $deleteCartUrl,

        $headers

    );


// =====================================================
// CART DELETE ERROR
// =====================================================

if (
    !$deleteCartResult['success'] ||
    $deleteCartResult['http_code'] < 200 ||
    $deleteCartResult['http_code'] >= 300
) {

    // Order is already created.
    // We do not delete the order here because
    // the order itself is valid.

    echo json_encode([

        "success" => true,

        "message" =>
            "Order created successfully, but cart could not be cleared",

        "order_id" =>
            $orderId,

        "total_amount" =>
            $calculatedTotal,

        "payment_method" =>
            $paymentMethod,

        "payment_status" =>
            $paymentStatus,

        "order_status" =>
            $orderStatus,

        "delivery_date" =>
            $deliveryDateString

    ]);

    exit;
}


// =====================================================
// 9. FINAL SUCCESS RESPONSE
// =====================================================

echo json_encode([

    "success" => true,

    "message" =>
        "Order created successfully",

    "order" => [

        "id" =>
            $orderId,

        "user_id" =>
            $userId,

        "total_amount" =>
            $calculatedTotal,

        "address" =>
            $address,

        "phone" =>
            $phone,

        "payment_method" =>
            $paymentMethod,

        "payment_status" =>
            $paymentStatus,

        "order_status" =>
            $orderStatus,

        "delivery_date" =>
            $deliveryDateString

    ]

]);

?>