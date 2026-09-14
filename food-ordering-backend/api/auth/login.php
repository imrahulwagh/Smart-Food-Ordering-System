<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data"
    ]);
    exit;
}

if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required"
    ]);
    exit;
}

$email = trim($data['email']);
$password = $data['password'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid email address"
    ]);
    exit;
}

$url = $supabaseUrl . "/auth/v1/token?grant_type=password";

$body = json_encode([
    "email" => $email,
    "password" => $password
]);

$headers = [
    "apikey: " . $supabaseKey,
    "Content-Type: application/json"
];

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
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
        "message" => "Supabase connection error",
        "details" => $error
    ]);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

$result = json_decode($response, true);

if ($httpCode < 200 || $httpCode >= 300) {
    http_response_code($httpCode);

    echo json_encode([
        "success" => false,
        "message" => $result['msg'] ?? $result['message'] ?? "Invalid email or password",
        "details" => $result
    ]);
    exit;
}

$userId = $result['user']['id'] ?? null;

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "user_id" => $userId,
    "access_token" => $result['access_token'] ?? null,
    "refresh_token" => $result['refresh_token'] ?? null,
    "user" => [
        "id" => $userId,
        "email" => $result['user']['email'] ?? $email
    ]
]);

?>