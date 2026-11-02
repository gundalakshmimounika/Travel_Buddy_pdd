<?php
require_once 'db_config.php';
checkDbConnection($conn);

$data = getRequestData();
$action = $data['action'] ?? 'get';

if ($action === 'get') {
    $email = trim($data['email'] ?? '');
    if (empty($email)) {
        echo json_encode(["status" => "error", "message" => "Email is required"]);
        exit;
    }

    $stmt = $conn->prepare("SELECT id, user_email, title, message, type, timestamp FROM alerts WHERE user_email = ? ORDER BY timestamp DESC");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    $alerts = [];
    while ($row = $result->fetch_assoc()) {
        $alerts[] = [
            "id" => (int)$row['id'],
            "user_email" => $row['user_email'],
            "title" => $row['title'],
            "message" => $row['message'],
            "type" => $row['type'],
            "timestamp" => (float)$row['timestamp']
        ];
    }
    $stmt->close();
    echo json_encode(["status" => "success", "data" => $alerts]);
    exit;
} elseif ($action === 'add') {
    $email = trim($data['email'] ?? '');
    $title = trim($data['title'] ?? '');
    $message = trim($data['message'] ?? '');
    $type = trim($data['type'] ?? 'general');
    $timestamp = (string)round(microtime(true) * 1000);

    if (empty($email) || empty($title) || empty($message)) {
        echo json_encode(["status" => "error", "message" => "Email, title, and message are required"]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO alerts (user_email, title, message, type, timestamp) VALUES (?, ?, ?, ?, ?)");
    // Bind as string to avoid 32-bit integer overflow truncation
    $stmt->bind_param("sssss", $email, $title, $message, $type, $timestamp);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Alert added successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to add alert: " . $stmt->error]);
    }
    $stmt->close();
    exit;
} elseif ($action === 'clear') {
    $email = trim($data['email'] ?? '');
    if (empty($email)) {
        echo json_encode(["status" => "error", "message" => "Email is required"]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM alerts WHERE user_email = ?");
    $stmt->bind_param("s", $email);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Alerts cleared successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to clear alerts"]);
    }
    $stmt->close();
    exit;
} elseif ($action === 'delete') {
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(["status" => "error", "message" => "Invalid alert ID"]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM alerts WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Alert deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete alert"]);
    }
    $stmt->close();
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid action specified"]);
$conn->close();
?>
