<?php
require_once 'db_config.php';

$data = getRequestData();
$action = isset($data['action']) ? $data['action'] : (isset($_GET['action']) ? $_GET['action'] : 'get_spots');
$destination = isset($data['destination']) ? trim($data['destination']) : (isset($_GET['destination']) ? trim($_GET['destination']) : 'All');

$allSpots = [
    [
        'id' => 1,
        'title' => 'Shore Temple Sunrise Arch',
        'destination' => 'Mahabalipuram',
        'image' => 'assets/img_mahabali.png',
        'best_time' => '6:00 AM - 6:45 AM (Golden Hour)',
        'lighting' => 'Warm Low Golden Light with Ocean Fog',
        'crowd_level' => 'Low at Sunrise, Very High after 9 AM',
        'coordinates' => '12.6167° N, 80.1983° E',
        'optimal_angle' => 'Low-angle wide shot (16-24mm) with the 7th-century granite spire framed against the pink sunrise sky and crashing waves.',
        'camera_settings' => 'f/8.0, 1/320s, ISO 100, Polarizing Filter recommended',
        'ai_tip' => 'Squat near the tidal pool on the eastern edge to capture a mirror reflection of the temple tower!'
    ],
    [
        'id' => 2,
        'title' => 'Pancha Rathas Monolithic Symmetry',
        'destination' => 'Mahabalipuram',
        'image' => 'assets/img_mahabali.png',
        'best_time' => '4:30 PM - 5:45 PM (Late Afternoon)',
        'lighting' => 'Warm Angled Sidelight highlighting stone carvings',
        'crowd_level' => 'Moderate',
        'coordinates' => '12.6145° N, 80.1944° E',
        'optimal_angle' => 'Step 30 meters back and align the life-sized stone elephant in the foreground with Dharmaraja Ratha in the background.',
        'camera_settings' => 'f/5.6, 1/250s, ISO 200, 35mm portrait perspective',
        'ai_tip' => 'Use Portrait Mode with 2x zoom to compress the monolithic chariots and blur the backdrop tourists.'
    ],
    [
        'id' => 3,
        'title' => 'French Quarter Pastel Bougainvillea Villa',
        'destination' => 'Pondicherry',
        'image' => 'assets/img_pondy.png',
        'best_time' => '7:00 AM - 8:30 AM (Soft Morning Diffuse Light)',
        'lighting' => 'Gentle directional sunlight without harsh midday shadows',
        'crowd_level' => 'Very Quiet before cafes open',
        'coordinates' => '11.9338° N, 79.8359° E (Rue Romain Rolland)',
        'optimal_angle' => 'Eye-level horizontal composition capturing the mustard-yellow colonial wall, arched wooden louvered windows, and vibrant magenta flowers.',
        'camera_settings' => 'f/4.0, 1/400s, ISO 100, vivid color profile',
        'ai_tip' => 'Wear white, linen, or pastel blue attire for high aesthetic contrast against the golden mustard walls!'
    ],
    [
        'id' => 4,
        'title' => 'Promenade Rock Beach Waves Silhouette',
        'destination' => 'Pondicherry',
        'image' => 'assets/img_pondy.png',
        'best_time' => '5:45 AM - 6:30 AM (Dawn & Blue Hour)',
        'lighting' => 'Cool Indigo & Orange Gradient Horizon',
        'crowd_level' => 'Morning joggers only',
        'coordinates' => '11.9325° N, 79.8368° E (Gandhi Statue Plaza)',
        'optimal_angle' => 'Position camera at knee height on the black basalt boulders to frame incoming cresting waves against the French lighthouse.',
        'camera_settings' => 'f/11, 2.0s Long Exposure with ND filter for silky water mist',
        'ai_tip' => 'Rest phone on a flat rock or small travel tripod for a silky long-exposure waterfall-style ocean effect.'
    ],
    [
        'id' => 5,
        'title' => 'Dolphin\'s Nose Mist & Tea Valley Cliff',
        'destination' => 'Ooty',
        'image' => 'assets/img_ooty.png',
        'best_time' => '7:30 AM - 9:00 AM (Rolling Mountain Mist)',
        'lighting' => 'Atmospheric Cloud Layer with volumetric God-rays',
        'crowd_level' => 'Low in early morning',
        'coordinates' => '11.3652° N, 76.8741° E',
        'optimal_angle' => 'High vantage panoramic framing showing the sharp nose-shaped cliff edge jutting out above the misty Catherine Falls valley.',
        'camera_settings' => 'f/8.0, 1/500s, ISO 160, Telephoto 70-200mm',
        'ai_tip' => 'Wait 5 minutes for morning mist patches to part — the contrast between sunlit tea leaves and shadowed canyon is dramatic.'
    ]
];

$filtered = [];
if ($destination === 'All' || empty($destination)) {
    $filtered = $allSpots;
} else {
    foreach ($allSpots as $spot) {
        if (stripos($spot['destination'], $destination) !== false) {
            $filtered[] = $spot;
        }
    }
    if (empty($filtered)) {
        $filtered = $allSpots;
    }
}

echo json_encode([
    'status' => 'success',
    'filter' => $destination,
    'total' => count($filtered),
    'spots' => $filtered,
    'destinations' => ['All', 'Mahabalipuram', 'Pondicherry', 'Ooty']
]);
