<?php
require_once 'db_config.php';

$data = getRequestData();
$action = isset($data['action']) ? $data['action'] : (isset($_GET['action']) ? $_GET['action'] : 'get_members');
$userEmail = isset($data['user_email']) ? trim($data['user_email']) : 'aarav.mehta@gmail.com';
$userName = isset($data['user_name']) ? trim($data['user_name']) : 'Aarav Mehta';

// Default mock group members if DB is empty or offline
$defaultMembers = [
    [
        'id' => 1,
        'name' => 'Aarav Mehta',
        'email' => 'aarav.mehta@gmail.com',
        'status' => 'safe', // safe, separated, beacon
        'status_text' => 'Stationed at Shore Temple Arch',
        'distance' => '0 m (You)',
        'direction' => 'Current Location',
        'lat' => 12.6167,
        'lng' => 80.1983,
        'battery' => '84%',
        'last_ping' => 'Just now',
        'is_me' => true
    ],
    [
        'id' => 2,
        'name' => 'Rohan Verma',
        'email' => 'rohan.verma@gmail.com',
        'status' => 'separated',
        'status_text' => 'Looking for group near Lighthouse',
        'distance' => '320 m away',
        'direction' => 'South-West (210°)',
        'lat' => 12.6142,
        'lng' => 80.1965,
        'battery' => '42%',
        'last_ping' => '2 mins ago',
        'is_me' => false
    ],
    [
        'id' => 3,
        'name' => 'Sneha Patel',
        'email' => 'sneha.patel@gmail.com',
        'status' => 'safe',
        'status_text' => 'At Beach Cafe parking',
        'distance' => '180 m away',
        'direction' => 'North-East (45°)',
        'lat' => 12.6181,
        'lng' => 80.1995,
        'battery' => '91%',
        'last_ping' => '4 mins ago',
        'is_me' => false
    ],
    [
        'id' => 4,
        'name' => 'Priya Sharma',
        'email' => 'priya.sharma@gmail.com',
        'status' => 'beacon',
        'status_text' => 'Waiting at Emergency Beacon Point',
        'distance' => '250 m away',
        'direction' => 'East (90°)',
        'lat' => 12.6169,
        'lng' => 80.2001,
        'battery' => '67%',
        'last_ping' => '1 min ago',
        'is_me' => false
    ]
];

$defaultBeacon = [
    'name' => 'Main Beach Plaza & Monument Arch',
    'lat' => 12.6167,
    'lng' => 80.1983,
    'description' => 'Designated group rendezvous point under the tourist signpost',
    'set_by' => 'Aarav Mehta',
    'time_set' => '10:15 AM'
];

if ($action === 'get_members') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Group members and beacon loaded',
        'members' => $defaultMembers,
        'beacon' => $defaultBeacon,
        'emergency_contacts' => [
            ['name' => 'Local Tourist Police', 'phone' => '112 / 100', 'type' => 'Police'],
            ['name' => 'Medical Helpline', 'phone' => '108', 'type' => 'Ambulance'],
            ['name' => 'Nearest Hospital Desk', 'phone' => '+91 44 2744 2424', 'type' => 'Medical']
        ]
    ]);
    exit;
}

if ($action === 'send_sos' || $action === 'send_ping') {
    $note = isset($data['note']) && !empty($data['note']) ? trim($data['note']) : 'SOS! I got separated from the group. Please send assistance!';
    $lat = isset($data['lat']) ? (float)$data['lat'] : 12.6167;
    $lng = isset($data['lng']) ? (float)$data['lng'] : 80.1983;

    // In a live system, this sends pushes and updates DB
    echo json_encode([
        'status' => 'success',
        'message' => 'SOS Alert broadcasted to all 3 group members with your live coordinates!',
        'alert' => [
            'sender' => $userName,
            'note' => $note,
            'lat' => $lat,
            'lng' => $lng,
            'timestamp' => date('Y-m-d H:i:s'),
            'status' => 'active'
        ]
    ]);
    exit;
}

if ($action === 'set_beacon') {
    $beaconName = isset($data['beacon_name']) ? trim($data['beacon_name']) : 'Central Town Plaza';
    $beaconDesc = isset($data['beacon_desc']) ? trim($data['beacon_desc']) : 'Meet outside the entrance gate';

    echo json_encode([
        'status' => 'success',
        'message' => 'Meeting Beacon updated successfully!',
        'beacon' => [
            'name' => $beaconName,
            'lat' => 12.6167,
            'lng' => 80.1983,
            'description' => $beaconDesc,
            'set_by' => $userName,
            'time_set' => date('h:i A')
        ]
    ]);
    exit;
}

if ($action === 'resolve_sos') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Group status set to Safe! All members reunited.'
    ]);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
