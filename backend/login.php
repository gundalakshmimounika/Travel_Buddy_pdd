<?php
require_once 'db_config.php';
checkDbConnection($conn);

$data = getRequestData();
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Email and password are required"]);
    exit;
}

// Check credentials in database
$stmt = $conn->prepare("SELECT full_name, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->bind_result($full_name, $db_password);

if ($stmt->fetch()) {
    if ($password === $db_password) {
        echo json_encode([
            "status" => "success",
            "message" => "Login successful",
            "full_name" => $full_name,
            "email" => $email
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
}

$stmt->close();
$conn->close();
?>
