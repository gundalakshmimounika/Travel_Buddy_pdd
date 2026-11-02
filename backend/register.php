<?php
require_once 'db_config.php';
checkDbConnection($conn);

$data = getRequestData();
$full_name = trim($data['full_name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($full_name) || empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "All fields are required"]);
    exit;
}

// 1. Email must end with "@gmail.com"
if (substr(strtolower($email), -10) !== '@gmail.com') {
    echo json_encode(["status" => "error", "message" => "Email must end with @gmail.com"]);
    exit;
}

// 2. Password must be longer than 6 characters
if (strlen($password) <= 6) {
    echo json_encode(["status" => "error", "message" => "Password must be longer than 6 characters"]);
    exit;
}

// 3. Password must contain at least 1 uppercase letter
if (!preg_match('/[A-Z]/', $password)) {
    echo json_encode(["status" => "error", "message" => "Password must contain at least 1 uppercase letter"]);
    exit;
}

// Check if email already registered
$check_stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check_stmt->bind_param("s", $email);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "This email is already registered"]);
    $check_stmt->close();
    exit;
}
$check_stmt->close();

// Insert user into database
$insert_stmt = $conn->prepare("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)");
$insert_stmt->bind_param("sss", $full_name, $email, $password);

if ($insert_stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Account created successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to create account: " . $insert_stmt->error]);
}

$insert_stmt->close();
$conn->close();
?>
