<?php

require_once "../../config/db.php";

// ==========================================
// CORS
// ==========================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// ==========================================
// HANDLE OPTIONS REQUEST
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
// SUPABASE HEADERS
// ==========================================

$headers = [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json"
];

// ==========================================
// GET ALL ORDERS
// ==========================================

$orderUrl =
    $supabaseUrl .
    "/rest/v1/orders" .
    "?select=id,user_id,total_amount,address,phone,payment_method,order_status,status,created_at" .
    "&order=created_at.desc";


// ==========================================
// CURL REQUEST
// ==========================================

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $orderUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);

$curlError = curl_error($ch);

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);


// ==========================================
// CURL ERROR
// ==========================================

if ($response === false || $curlError) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to connect to Supabase.",
        "error" => $curlError
    ]);

    exit;
}


// ==========================================
// SUPABASE ERROR / EMPTY HANDLING
// ==========================================

if ($httpCode < 200 || $httpCode >= 300) {

    echo json_encode([
        "success" => true,
        "message" => "All orders fetched successfully",
        "orders" => []
    ]);

    exit;
}


// ==========================================
// DECODE RESPONSE
// ==========================================

$orders = json_decode($response, true);

if (!is_array($orders)) {

    $orders = [];
}

// ==========================================
// USER NAME LOOKUP
// ==========================================

$userMap = [];
$userIds = array_values(array_filter(array_unique(array_column($orders, 'user_id'))));

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


// ==========================================
// FORMAT ORDERS
// ==========================================

$formattedOrders = [];

foreach ($orders as $order) {

    $uid = $order["user_id"] ?? "";
    $customerName = $userMap[$uid] ?? "Customer";

    $status = $order["status"] ?? $order["order_status"] ?? "Pending";

    $formattedOrders[] = [

        "id" =>
            $order["id"] ?? null,

        "user_id" =>
            $order["user_id"] ?? null,

        "customer_name" =>
            $customerName,

        "total_amount" =>
            (float)($order["total_amount"] ?? 0),

        "address" =>
            $order["address"] ?? "",

        "phone" =>
            $order["phone"] ?? "",

        "payment_method" =>
            $order["payment_method"] ?? "",

        "order_status" =>
            $order["order_status"] ?? $status,

        "status" =>
            $status,

        "created_at" =>
            $order["created_at"] ?? null
    ];
}


// ==========================================
// SUCCESS RESPONSE
// ==========================================

echo json_encode([

    "success" => true,

    "message" =>
        "All orders fetched successfully",

    "orders" =>
        $formattedOrders

]);

?>