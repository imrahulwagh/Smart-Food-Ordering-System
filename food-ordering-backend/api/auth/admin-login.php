<?php

header("Content-Type: application/json");

require_once "../../config/db.php";

// Get JSON data from Postman / Angular
$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$password = $data["password"] ?? "";

// Check empty fields
if ($username === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Username and password are required."
    ]);
    exit;
}

// Supabase REST API URL
$url = $supabaseUrl . "/rest/v1/admin?username=eq." . urlencode($username) . "&select=*";

// Create CURL request
$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json"
]);

// Execute request
$response = curl_exec($ch);

// CURL error
if ($response === false) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to connect to Supabase."
    ]);

    curl_close($ch);
    exit;
}

// Get HTTP status code
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

// Convert response to PHP array
$admins = json_decode($response, true);

// Check Supabase error
if ($httpCode < 200 || $httpCode >= 300) {
    echo json_encode([
        "success" => false,
        "message" => "Database error.",
        "error" => $admins
    ]);
    exit;
}

// Check admin exists
if (!is_array($admins) || count($admins) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid admin username or password."
    ]);
    exit;
}

// Get admin record
$admin = $admins[0];

// Check admin status
if (!$admin["status"]) {
    echo json_encode([
        "success" => false,
        "message" => "Admin account is inactive."
    ]);
    exit;
}

// Check plain-text password
if ($password !== $admin["password"]) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid admin username or password."
    ]);
    exit;
}

// Login successful
echo json_encode([
    "success" => true,
    "message" => "Admin login successful.",
    "admin_id" => $admin["id"],
    "username" => $admin["username"],
    "email" => $admin["email"]
]);

?>