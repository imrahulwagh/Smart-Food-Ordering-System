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

// ==========================================
// GET ORDERS
// ==========================================

$orderUrl =
    $supabaseUrl .
    "/rest/v1/orders" .
    "?select=id,user_id,total_amount,status,order_status,created_at" .
    "&order=created_at.desc";

$ch = curl_init($orderUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);

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

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$orders = json_decode($response, true);

if ($httpCode < 200 || $httpCode >= 300) {
    // If orders table is empty or error, return clean empty dashboard
    echo json_encode([
        "success" => true,
        "message" => "Dashboard initialized",
        "stats" => [
            "totalOrders" => 0,
            "totalRevenue" => 0,
            "pendingOrders" => 0,
            "preparingOrders" => 0,
            "deliveredOrders" => 0
        ],
        "recentOrders" => []
    ]);
    exit;
}

if (!is_array($orders)) {
    $orders = [];
}

// ==========================================
// TOTAL ORDERS & STATS
// ==========================================

$totalOrders = count($orders);
$totalRevenue = 0;
$pendingOrders = 0;
$preparingOrders = 0;
$deliveredOrders = 0;

foreach ($orders as $order) {
    $totalRevenue += (float)($order['total_amount'] ?? 0);
    $status = strtolower(trim($order['status'] ?? $order['order_status'] ?? 'pending'));

    if ($status === 'pending') {
        $pendingOrders++;
    } elseif ($status === 'preparing') {
        $preparingOrders++;
    } elseif ($status === 'delivered') {
        $deliveredOrders++;
    }
}

// ==========================================
// RECENT ORDERS & USER LOOKUP
// ==========================================

$recentOrders = array_slice($orders, 0, 5);

// Fetch user names for recent orders
$userMap = [];
$userIds = array_values(array_filter(array_unique(array_column($recentOrders, 'user_id'))));

if (!empty($userIds)) {
    $profileUrl = $supabaseUrl . "/rest/v1/profiles?id=in.(" . implode(',', array_map('urlencode', $userIds)) . ")&select=id,full_name";
    $pch = curl_init($profileUrl);
    curl_setopt($pch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($pch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($pch, CURLOPT_TIMEOUT, 10);
    $pResp = curl_exec($pch);
    curl_close($pch);

    if ($pResp) {
        $pData = json_decode($pResp, true);
        if (is_array($pData)) {
            foreach ($pData as $p) {
                if (isset($p['id'], $p['full_name'])) {
                    $userMap[$p['id']] = $p['full_name'];
                }
            }
        }
    }
}

$formattedRecentOrders = [];

foreach ($recentOrders as $order) {
    $uid = $order['user_id'] ?? '';
    $customerName = $userMap[$uid] ?? 'Customer';
    $status = $order['status'] ?? $order['order_status'] ?? 'Pending';

    $formattedRecentOrders[] = [
        "id" => $order['id'] ?? null,
        "customer_name" => $customerName,
        "created_at" => $order['created_at'] ?? null,
        "total_amount" => (float)($order['total_amount'] ?? 0),
        "status" => $status,
        "order_status" => $order['order_status'] ?? $status
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