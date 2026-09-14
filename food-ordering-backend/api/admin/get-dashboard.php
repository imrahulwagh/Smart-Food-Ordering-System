<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


// ==========================================
// OPTIONS REQUEST
// ==========================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;
}


// ==========================================
// ONLY GET REQUEST
// ==========================================

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only GET request is allowed"
    ]);

    exit;
}


// ==========================================
// DATABASE CONFIG
// ==========================================

require_once __DIR__ . '/../../config/db.php';


// ==========================================
// SUPABASE HEADERS
// ==========================================

$headers = [

    "apikey: " . $supabaseSecretKey,

    "Authorization: Bearer " . $supabaseSecretKey,

    "Content-Type: application/json"

];


// ==========================================
// GET ORDERS
// ==========================================

$orderUrl =
    $supabaseUrl .
    "/rest/v1/orders" .
    "?select=id,user_id,total_amount,status,order_status,created_at,profiles(full_name)" .
    "&order=created_at.desc";


$ch = curl_init($orderUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

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


$response = curl_exec($ch);


// ==========================================
// CURL ERROR
// ==========================================

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


// ==========================================
// HTTP STATUS
// ==========================================

$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);


curl_close($ch);


// ==========================================
// DECODE RESPONSE
// ==========================================

$orders = json_decode(
    $response,
    true
);


// ==========================================
// SUPABASE ERROR
// ==========================================

if (
    $httpCode < 200 ||
    $httpCode >= 300
) {

    http_response_code($httpCode);

    echo json_encode([

        "success" => false,

        "message" => "Failed to fetch dashboard orders",

        "details" => $orders

    ]);

    exit;
}


// ==========================================
// CHECK ARRAY
// ==========================================

if (!is_array($orders)) {

    $orders = [];

}


// ==========================================
// TOTAL ORDERS
// ==========================================

$totalOrders = count($orders);


// ==========================================
// TOTAL REVENUE
// ==========================================

$totalRevenue = 0;


// ==========================================
// STATUS COUNTS
// ==========================================

$pendingOrders = 0;

$preparingOrders = 0;

$deliveredOrders = 0;


// ==========================================
// CALCULATE DASHBOARD DATA
// ==========================================

foreach ($orders as $order) {


    // --------------------------------------
    // REVENUE
    // --------------------------------------

    $totalRevenue +=
        (float) (
            $order['total_amount'] ?? 0
        );


    // --------------------------------------
    // STATUS
    // --------------------------------------

    $status =
        $order['status']
        ??
        $order['order_status']
        ??
        'Pending';


    $status = strtolower(
        trim($status)
    );


    // --------------------------------------
    // PENDING
    // --------------------------------------

    if ($status === 'pending') {

        $pendingOrders++;

    }


    // --------------------------------------
    // PREPARING
    // --------------------------------------

    if ($status === 'preparing') {

        $preparingOrders++;

    }


    // --------------------------------------
    // DELIVERED
    // --------------------------------------

    if ($status === 'delivered') {

        $deliveredOrders++;

    }

}


// ==========================================
// RECENT ORDERS
// ==========================================

// Already sorted latest first.
// Take only latest 5 orders.

$recentOrders = array_slice(
    $orders,
    0,
    5
);


// ==========================================
// FORMAT RECENT ORDERS
// ==========================================

$formattedRecentOrders = [];


foreach ($recentOrders as $order) {


    // --------------------------------------
    // CUSTOMER NAME
    // --------------------------------------

    $customerName = 'Customer';


    if (
        isset($order['profiles']) &&
        is_array($order['profiles'])
    ) {

        $customerName =
            $order['profiles']['full_name']
            ??
            'Customer';

    }


    // --------------------------------------
    // STATUS
    // --------------------------------------

    $status =
        $order['status']
        ??
        $order['order_status']
        ??
        'Pending';


    // --------------------------------------
    // ADD ORDER
    // --------------------------------------

    $formattedRecentOrders[] = [

        "id" =>
            $order['id'] ?? null,

        "customer_name" =>
            $customerName,

        "created_at" =>
            $order['created_at'] ?? null,

        "total_amount" =>
            (float) (
                $order['total_amount'] ?? 0
            ),

        "status" =>
            $status,

        "order_status" =>
            $order['order_status'] ?? $status

    ];

}


// ==========================================
// FINAL RESPONSE
// ==========================================

echo json_encode([

    "success" => true,

    "message" =>
        "Dashboard data fetched successfully",

    "stats" => [

        "totalOrders" =>
            $totalOrders,

        "totalRevenue" =>
            $totalRevenue,

        "pendingOrders" =>
            $pendingOrders,

        "preparingOrders" =>
            $preparingOrders,

        "deliveredOrders" =>
            $deliveredOrders

    ],

    "recentOrders" =>
        $formattedRecentOrders

]);

?>