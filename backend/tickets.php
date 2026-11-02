<?php
require_once 'config.php';

$from = trim($_GET['from'] ?? ($_POST['from'] ?? ''));
$to = trim($_GET['to'] ?? ($_POST['to'] ?? ''));

if (empty($from) || empty($to)) {
    echo json_encode(["status" => "error", "message" => "From and To locations are required"]);
    exit;
}

$cache_dir = __DIR__ . "/cache";
if (!is_dir($cache_dir)) {
    @mkdir($cache_dir, 0777, true);
}

$cache_file = $cache_dir . "/tickets_" . md5(strtolower($from . "_" . $to)) . ".json";
$cache_time = 7 * 24 * 60 * 60; // 7 days

if (file_exists($cache_file) && (time() - filemtime($cache_file) < $cache_time)) {
    $cached_data = file_get_contents($cache_file);
    if (!empty($cached_data)) {
        echo trim($cached_data);
        exit;
    }
}

$prompt = "Provide realistic travel ticket options from '$from' to '$to'.
Return ONLY a valid JSON array of objects with the following exact keys:
- type (String): Mode of transport (must be one of 'Airways', 'Train', 'Bus', 'Cab')
- price (String): Estimated realistic price formatted in INR without spaces (e.g., '₹4500')
- duration (String): Estimated realistic travel duration (e.g., '1h 20m')

Ensure exactly 3 or 4 reasonable options are provided.
Example: [{\"type\": \"Airways\", \"price\": \"₹4500\", \"duration\": \"1h 20m\"}, {\"type\": \"Train\", \"price\": \"₹850\", \"duration\": \"6h 45m\"}]";

$response = callGemini($prompt, true);
$tickets_data = null;

if (isset($response['success'])) {
    $clean_json = trim($response['text']);
    $tickets_data = json_decode($clean_json, true);
}

if ($tickets_data !== null && is_array($tickets_data)) {
    $final_output = json_encode(["status" => "success", "data" => $tickets_data]);
    @file_put_contents($cache_file, $final_output);
    echo $final_output;
    exit;
}

// Fallback realistic ticket pricing options
$fallback_tickets = [
    [
        "type" => "Airways",
        "price" => "₹4800",
        "duration" => "1h 35m"
    ],
    [
        "type" => "Train",
        "price" => "₹950",
        "duration" => "7h 15m"
    ],
    [
        "type" => "Bus",
        "price" => "₹680",
        "duration" => "8h 45m"
    ],
    [
        "type" => "Cab",
        "price" => "₹5200",
        "duration" => "6h 30m"
    ]
];

$final_output = json_encode(["status" => "success", "data" => $fallback_tickets]);
@file_put_contents($cache_file, $final_output);
echo $final_output;
exit;
?>
