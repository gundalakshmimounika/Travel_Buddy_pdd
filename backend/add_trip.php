<?php
require_once 'db_config.php';
checkDbConnection($conn);

$data = getRequestData();
$email = trim($data['email'] ?? '');
$destination = trim($data['destination'] ?? '');
$image_res = (int)($data['image_res'] ?? 0);

if (!empty($email) && !empty($destination)) {
    $stmt = $conn->prepare("INSERT INTO planned_trips (user_email, destination, image_res) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE image_res = VALUES(image_res)");
    $stmt->bind_param("ssi", $email, $destination, $image_res);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Trip added successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to add trip: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Email and destination are required"]);
}

$conn->close();
?>
