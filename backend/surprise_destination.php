<?php
require_once 'db_config.php';

$data = getRequestData();
$action = isset($data['action']) ? $data['action'] : (isset($_GET['action']) ? $_GET['action'] : 'get_mystery');

$mysteryPackages = [
    [
        'id' => 'mystery_01',
        'code_name' => 'Operation Emerald Shores',
        'vibe' => 'Tropical Coastal & Heritage Architecture',
        'budget_tier' => '₹8,000 - ₹14,000',
        'departure_date' => date('Y-m-d H:i:s', strtotime('+2 days 18 hours')),
        'is_revealed' => false,
        'clues' => [
            [
                'stage' => 1,
                'title' => 'Climate Forecast',
                'badge' => 'Weather Clue',
                'hint' => 'Expect pleasant 27°C with ocean breeze and high humidity. Light cotton attire is recommended.',
                'unlocked' => true
            ],
            [
                'stage' => 2,
                'title' => 'Packing Essentials',
                'badge' => 'Luggage Clue',
                'hint' => 'Pack UV sunglasses, slip-on walking sandals, swimwear, but make room for sacred temple decorum (covered shoulders).',
                'unlocked' => true
            ],
            [
                'stage' => 3,
                'title' => 'Culinary Hint',
                'badge' => 'Gastronomy Clue',
                'hint' => 'Famous for fresh catch grilled fish on banana leaves, roasted filter coffee, and golden crispy dosas with 4 chutneys.',
                'unlocked' => true
            ],
            [
                'stage' => 4,
                'title' => 'Historical Enigma',
                'badge' => 'Landmark Clue',
                'hint' => 'Ancient monolithic rock-cut cave shrines and temples dating back to the 7th-century Pallava dynasty overlooking the ocean waves.',
                'unlocked' => true
            ]
        ],
        'revealed_details' => [
            'destination' => 'Mahabalipuram, Tamil Nadu',
            'tagline' => 'The Monolithic Shore Wonder of South India',
            'hero_image' => 'assets/img_mahabali.png',
            'flight_duration' => '1.5 hr flight to Chennai + 1 hr scenic East Coast Road drive',
            'top_attractions' => [
                'Shore Temple (UNESCO World Heritage Site)',
                'Pancha Rathas (Monolithic Chariots)',
                'Krishna\'s Butterball & Arjuna\'s Penance',
                'Wide Serene Sandy Shoreline & Surfing Point'
            ],
            'recommended_stay' => 'Radisson Blu Resort Temple Bay or Chariot Beach Resort',
            'budget_estimate' => '₹9,500 total estimated per traveler',
            'best_photospot' => 'Sunrise silhouette against the Shore Temple spires'
        ]
    ]
];

if ($action === 'get_mystery') {
    echo json_encode([
        'status' => 'success',
        'package' => $mysteryPackages[0]
    ]);
    exit;
}

if ($action === 'reveal') {
    $package = $mysteryPackages[0];
    $package['is_revealed'] = true;
    echo json_encode([
        'status' => 'success',
        'message' => 'Surprise Destination Successfully Revealed!',
        'package' => $package
    ]);
    exit;
}

if ($action === 'create_mystery') {
    $pref = isset($data['preference']) ? $data['preference'] : 'Coastal';
    $budget = isset($data['budget']) ? $data['budget'] : '10000';
    echo json_encode([
        'status' => 'success',
        'message' => 'Mystery Voyage generated! Keep it secret until departure.',
        'package_id' => 'mystery_' . time()
    ]);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
