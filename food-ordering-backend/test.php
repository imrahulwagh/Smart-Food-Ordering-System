<?php

require_once __DIR__ . '/config/db.php';

$url = $supabaseUrl . "/rest/v1/profiles?select=*";

$headers = [
    "apikey: " . $supabaseKey,
    "Authorization: Bearer " . $supabaseKey,
    "Content-Type: application/json"
];

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);

if ($response === false) {
    echo "Connection Error: " . curl_error($ch);
} else {
    echo "Supabase Response:<br>";
    echo "<pre>";
    print_r(json_decode($response, true));
    echo "</pre>";
}

curl_close($ch);