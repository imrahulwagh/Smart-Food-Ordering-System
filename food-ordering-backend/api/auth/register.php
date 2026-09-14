<?php
// HEADERS
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// HANDLE OPTIONS / PREFLIGHT
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;
}

// ONLY POST REQUEST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST request is allowed"
    ]);

    exit;
}

// LOAD SUPABASE CONFIG
require_once __DIR__ . '/../../config/db.php';

// CHECK CONFIG
if (
    empty($supabaseUrl) ||
    empty($supabaseKey) ||
    empty($supabaseSecretKey)
) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Supabase configuration is missing"
    ]);

    exit;
}

// GET JSON DATA
$input = file_get_contents("php://input");

$data = json_decode($input, true);

// CHECK JSON
if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data"
    ]);

    exit;
}

// CHECK REQUIRED FIELDS
if (
    empty($data['name']) ||
    empty($data['email']) ||
    empty($data['phone']) ||
    empty($data['password']) ||
    empty($data['confirmPassword'])
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);

    exit;
}

// GET VALUES
$name = trim($data['name']);
$email = trim($data['email']);
$phone = trim($data['phone']);
$password = $data['password'];
$confirmPassword = $data['confirmPassword'];

// PASSWORD MATCH
if ($password !== $confirmPassword) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Password and Confirm Password do not match"
    ]);
    exit;
}

// PASSWORD LENGTH
if (strlen($password) < 6) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 6 characters"
    ]);

    exit;
}

// EMAIL VALIDATION
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid email address"
    ]);

    exit;
}
// 1. CREATE USER IN SUPABASE AUTH
$authUrl = $supabaseUrl . "/auth/v1/signup";
$authBody = json_encode([
    "email" => $email,
    "password" => $password
]);
$authHeaders = [
    "apikey: " . $supabaseKey,
    "Authorization: Bearer " . $supabaseKey,
    "Content-Type: application/json"

];

$ch = curl_init($authUrl);
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
    $authBody
);
curl_setopt(
    $ch,
    CURLOPT_HTTPHEADER,
    $authHeaders
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

// SEND AUTH REQUEST
$authResponse = curl_exec($ch);

// CHECK CURL ERROR
if ($authResponse === false) {
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

// GET AUTH HTTP CODE
$authHttpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);
curl_close($ch);

// DECODE AUTH RESPONSE
$authResult = json_decode(
    $authResponse,
    true
);

// CHECK AUTH RESPONSE
if (
    $authHttpCode < 200 ||
    $authHttpCode >= 300
) {

    http_response_code($authHttpCode);
    echo json_encode([
        "success" => false,
        "message" =>
            $authResult['msg']
            ??
            $authResult['message']
            ??
            "Registration failed",
        "details" => $authResult

    ]);

    exit;
}

// GET USER ID
$userId =
    $authResult['user']['id']
    ??
    $authResult['id']
    ??
    null;
// USER ID CHECK

if (!$userId) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" =>
            "User ID not received from Supabase",
        "details" => $authResult

    ]);
    exit;
}

// 2. INSERT DATA INTO public.profiles
$profileUrl =
    $supabaseUrl . "/rest/v1/profiles";

// PROFILE DATA
$profileBody = json_encode([

    "id" => $userId,

    "full_name" => $name,

    "email" => $email,

    "phone" => $phone
]);

// PROFILE HEADERS
// IMPORTANT:
// Here we use SECRET KEY.
// This is the main change from your old code.
$profileHeaders = [

    "apikey: " . $supabaseSecretKey,
    "Authorization: Bearer " . $supabaseSecretKey,
    "Content-Type: application/json",
    "Prefer: return=representation"
];

// CREATE PROFILE REQUEST
$profileCh = curl_init($profileUrl);


curl_setopt(
    $profileCh,
    CURLOPT_RETURNTRANSFER,
    true
);


curl_setopt(
    $profileCh,
    CURLOPT_POST,
    true
);


curl_setopt(
    $profileCh,
    CURLOPT_POSTFIELDS,
    $profileBody
);


curl_setopt(
    $profileCh,
    CURLOPT_HTTPHEADER,
    $profileHeaders
);


curl_setopt(
    $profileCh,
    CURLOPT_CONNECTTIMEOUT,
    10
);

curl_setopt(
    $profileCh,
    CURLOPT_TIMEOUT,
    30
);
// SEND PROFILE REQUEST
$profileResponse =
    curl_exec($profileCh);

// PROFILE CURL ERROR
if ($profileResponse === false) {
    $error = curl_error($profileCh);
    curl_close($profileCh);
    echo json_encode([
        "success" => false,
        "message" =>
            "Account created but profile insert failed",
        "user_id" => $userId,
        "profile_saved" => false,
        "details" => $error
    ]);
    exit;
}

// GET PROFILE HTTP CODE
$profileHttpCode =
    curl_getinfo(
        $profileCh,
        CURLINFO_HTTP_CODE
    );
curl_close($profileCh);

// DECODE PROFILE RESPONSE
$profileResult =
    json_decode(
        $profileResponse,
        true
    );

// PROFILE SUCCESS
if (
    $profileHttpCode >= 200 &&
    $profileHttpCode < 300
) {
    echo json_encode([
        "success" => true,
        "message" =>
            "Registration successful",
        "user_id" => $userId,
        "profile_saved" => true,
        "profile" => [
            "id" => $userId,
            "full_name" => $name,
            "email" => $email,
            "phone" => $phone
        ]
    ]);
    exit;
}
// PROFILE FAILED
http_response_code($profileHttpCode);
echo json_encode([
    "success" => false,
    "message" =>
        "Account created but profile could not be saved",
    "user_id" => $userId,
    "profile_saved" => false,
    "details" => $profileResult
]);
?>