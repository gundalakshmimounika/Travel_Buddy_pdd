<?php
require_once 'config.php';

$raw = file_get_contents('php://input');
$json = !empty($raw) ? json_decode($raw, true) : [];
$question = trim($json['question'] ?? ($_POST['question'] ?? ($_GET['question'] ?? '')));

if (empty($question)) {
    echo json_encode(["status" => "error", "message" => "No question specified"]);
    exit;
}

$prompt = "You are 'Travel Buddy', a helpful and expert travel assistant. Answer this travel question: " . $question . ". Keep your answer concise, helpful, and adventurous. If it's not related to travel, politely redirect them back to travel topics.";

$ai_response = callGemini($prompt);

if (isset($ai_response['success']) && !empty($ai_response['text'])) {
    echo json_encode([
        "status" => "success",
        "answer" => trim($ai_response['text'])
    ]);
    exit;
}

// Smart, context-aware travel fallback when external API key limit is reached or offline
$lower = strtolower($question);
$smart_answer = "";

if (strpos($lower, 'pack') !== false) {
    $smart_answer = "For easy packing: bring versatile layered clothing, your passport/ID, a portable power bank, universal adapter, and comfortable walking shoes. Check our Packing List tab to tick off essentials!";
} elseif (strpos($lower, 'budget') !== false || strpos($lower, 'cost') !== false || strpos($lower, 'money') !== false || strpos($lower, 'price') !== false) {
    $smart_answer = "Top travel budgeting tip: book your tickets 3 to 4 weeks early, eat where the locals eat, and use our Budget Tracker to log your daily expenses in real-time!";
} elseif (strpos($lower, 'hotel') !== false || strpos($lower, 'stay') !== false || strpos($lower, 'resort') !== false) {
    $smart_answer = "When choosing accommodation, look for verified stays close to public transit or city centers with ratings above 4.2. Check out our Hotel Booking tab for curated options!";
} elseif (strpos($lower, 'weather') !== false || strpos($lower, 'climate') !== false || strpos($lower, 'rain') !== false) {
    $smart_answer = "Always check the 7-day forecast before heading out. Keep a compact umbrella and sunscreen handy so changing weather won't disrupt your itinerary!";
} elseif (strpos($lower, 'ooty') !== false) {
    $smart_answer = "Ooty is famous for its crisp hill air, Nilgiri Mountain Railway toy train, Doddabetta Peak, and lush tea plantations. Best time to visit is October to May!";
} elseif (strpos($lower, 'pondy') !== false || strpos($lower, 'pondicherry') !== false) {
    $smart_answer = "Pondicherry is wonderful for French colonial architecture in White Town, Promenade beach strolls, authentic bakeries, and visiting Auroville.";
} elseif (strpos($lower, 'mahabalipuram') !== false) {
    $smart_answer = "Mahabalipuram features magnificent UNESCO rock sculptures, the seaside Shore Temple, and Krishna's Butterball. Enjoy the coastal breeze and stone craft workshops!";
} elseif (strpos($lower, 'bali') !== false) {
    $smart_answer = "Bali offers stunning tropical beaches in Seminyak, peaceful rice terraces in Ubud, vibrant cultural dances, and sacred sea temples like Tanah Lot.";
} else {
    $smart_answer = "That sounds like an exciting journey! Plan your major sightseeing stops in the morning to beat the crowds, stay hydrated, and use our Tickets & Budget tools to make traveling effortless!";
}

echo json_encode([
    "status" => "success",
    "answer" => $smart_answer
]);
exit;
?>
