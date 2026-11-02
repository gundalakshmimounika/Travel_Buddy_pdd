<?php
require_once 'db_config.php';
checkDbConnection($conn);

$data = getRequestData();
$email = trim($data['email'] ?? '');
$trips = [];

if (!empty($email)) {
    $stmt = $conn->prepare("SELECT id, user_email, destination, image_res, created_at FROM planned_trips WHERE user_email = ? ORDER BY created_at DESC");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $trips[] = [
            "id" => (int)$row['id'],
            "user_email" => $row['user_email'],
            "destination" => $row['destination'],
            "image_res" => (int)$row['image_res'],
            "created_at" => $row['created_at']
        ];
    }
    $stmt->close();
}

echo json_encode(["status" => "success", "data" => $trips]);
$conn->close();
?>
