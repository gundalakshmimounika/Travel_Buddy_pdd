<?php
// Enable CORS for local web and mobile integrations
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Global Configuration for Travel Buddy Backend
define('GEMINI_API_KEY', getenv('GEMINI_API_KEY') ?: 'AIzaSyC4Vdx6PXg75_xGAfuXiEasVq_kMKBKK5g');

function callGemini($prompt, $jsonMode = false) {
    if (empty(GEMINI_API_KEY)) {
        return ["error" => "no_api_key"];
    }

    $models = ["gemini-1.5-flash", "gemini-2.0-flash"];
    
    $payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => $prompt]
                ]
            ]
        ]
    ];

    if ($jsonMode) {
        $payload["generationConfig"] = [
            "responseMimeType" => "application/json"
        ];
    }

    foreach ($models as $model) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . GEMINI_API_KEY;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && !empty($response)) {
            $result = json_decode($response, true);
            $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if ($text) {
                return ["success" => true, "text" => $text];
            }
        }

        if ($httpCode === 429) {
            return ["error" => "rate_limit", "code" => 429];
        }
    }

    return ["error" => "api_error", "code" => $httpCode ?? 500];
}
?>
