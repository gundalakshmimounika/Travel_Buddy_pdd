<?php
require_once 'db_config.php';
checkDbConnection($conn);

$data = getRequestData();
$email = trim($data['email'] ?? '');
$destination = trim($data['destination'] ?? '');

if (!empty($email) && !empty($destination)) {
    $stmt = $conn->prepare("DELETE FROM planned_trips WHERE user_email = ? AND destination = ?");
    $stmt->bind_param("ss", $email, $destination);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Trip deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete trip: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Email and destination are required"]);
}

$conn->close();
?>
