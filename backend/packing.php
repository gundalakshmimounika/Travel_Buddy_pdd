<?php
require_once 'db_config.php';
checkDbConnection($conn);

$data = getRequestData();
$action = $data['action'] ?? '';
$trip = trim($data['trip'] ?? '');

if (empty($trip)) {
    echo json_encode(["status" => "error", "message" => "No trip specified"]);
    exit;
}

if ($action === 'get') {
    $stmt = $conn->prepare("SELECT id, trip_title, item_name, category, is_packed FROM packing_list WHERE trip_title = ?");
    $stmt->bind_param("s", $trip);
    $stmt->execute();
    $result = $stmt->get_result();
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = [
            "id" => (int)$row['id'],
            "trip_title" => $row['trip_title'],
            "item_name" => $row['item_name'],
            "category" => $row['category'],
            "is_packed" => (bool)$row['is_packed']
        ];
    }
    $stmt->close();

    // If empty, seed with recommended defaults for this destination
    if (empty($items)) {
        $defaults = [
            ['Clothes', 'T-shirts (4)'], ['Clothes', 'Jeans & Shorts'], ['Clothes', 'Comfortable Footwear'],
            ['Documents', 'Government ID / Passport'], ['Documents', 'Hotel & Ticket Confirmations'],
            ['Gadgets', 'Phone Charger & Cable'], ['Gadgets', 'Portable Power Bank (10000mAh)'],
            ['Essentials', 'Personal Toiletries & Sunscreen']
        ];
        foreach ($defaults as $d) {
            $istmt = $conn->prepare("INSERT INTO packing_list (trip_title, category, item_name) VALUES (?, ?, ?)");
            $istmt->bind_param("sss", $trip, $d[0], $d[1]);
            $istmt->execute();
            $istmt->close();
        }

        // Fetch again after seeding
        $stmt = $conn->prepare("SELECT id, trip_title, item_name, category, is_packed FROM packing_list WHERE trip_title = ?");
        $stmt->bind_param("s", $trip);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                "id" => (int)$row['id'],
                "trip_title" => $row['trip_title'],
                "item_name" => $row['item_name'],
                "category" => $row['category'],
                "is_packed" => (bool)$row['is_packed']
            ];
        }
        $stmt->close();
    }

    echo json_encode(["status" => "success", "data" => $items]);
    exit;
} elseif ($action === 'add') {
    $item = trim($data['item'] ?? '');
    $category = trim($data['category'] ?? 'General');
    if (!empty($item)) {
        $stmt = $conn->prepare("INSERT INTO packing_list (trip_title, category, item_name) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $trip, $category, $item);
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Item added successfully", "id" => $conn->insert_id]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to add item"]);
        }
        $stmt->close();
    } else {
        echo json_encode(["status" => "error", "message" => "Item name is required"]);
    }
    exit;
} elseif ($action === 'toggle') {
    $id = (int)($data['id'] ?? 0);
    $status = (int)($data['status'] ?? 0);
    $stmt = $conn->prepare("UPDATE packing_list SET is_packed = ? WHERE id = ?");
    $stmt->bind_param("ii", $status, $id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Item status updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update item"]);
    }
    $stmt->close();
    exit;
} elseif ($action === 'delete') {
    $id = (int)($data['id'] ?? 0);
    $stmt = $conn->prepare("DELETE FROM packing_list WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Item deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete item"]);
    }
    $stmt->close();
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid action specified"]);
$conn->close();
?>
