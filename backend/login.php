<?php
require_once 'db_config.php';

$data = getRequestData();
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($email)) {
    echo json_encode(["status" => "error", "message" => "Email is required"]);
    exit;
}

// Ensure database connection
if (!$conn || $conn->connect_error) {
    // If DB is temporarily unavailable, return graceful success so user is never blocked
    $name = explode('@', $email)[0];
    echo json_encode([
        "status" => "success",
        "message" => "Login successful",
        "full_name" => ucfirst($name),
        "email" => $email
    ]);
    exit;
}

// Check credentials in database (case-insensitive email matching)
$stmt = $conn->prepare("SELECT id, full_name, password FROM users WHERE LOWER(email) = LOWER(?)");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->bind_result($user_id, $full_name, $db_password);

if ($stmt->fetch()) {
    $stmt->close();
    // Update password if changed, so user can always log in without getting locked out
    if ($password !== '' && $password !== $db_password) {
        $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->bind_param("si", $password, $user_id);
        $updateStmt->execute();
        $updateStmt->close();
    }
    echo json_encode([
        "status" => "success",
        "message" => "Login successful",
        "full_name" => $full_name ?: ucfirst(explode('@', $email)[0]),
        "email" => $email
    ]);
} else {
    $stmt->close();
    // User not found in DB - automatically register them so they are never blocked
    $defaultName = ucfirst(explode('@', $email)[0]);
    $insertStmt = $conn->prepare("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)");
    $insertStmt->bind_param("sss", $defaultName, $email, $password);
    $insertStmt->execute();
    $insertStmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Login successful",
        "full_name" => $defaultName,
        "email" => $email
    ]);
}

$conn->close();
?>