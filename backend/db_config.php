<?php
// Universal JSON and CORS Headers
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Handle HTTP OPTIONS preflight gracefully
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

/**
 * Universal Request Data Extractor.
 * Reads $_GET, $_POST, and php://input (JSON body) into a single unified array.
 * Ensures compatibility between Android Retrofit (@Field / @Body / @Query)
 * and Web Frontend (fetch with JSON or FormData).
 */
function getRequestData() {
    $data = [];
    if (!empty($_GET)) {
        $data = array_merge($data, $_GET);
    }
    if (!empty($_POST)) {
        $data = array_merge($data, $_POST);
    }
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $jsonData = json_decode($rawInput, true);
        if (is_array($jsonData)) {
            $data = array_merge($data, $jsonData);
        }
    }
    return $data;
}

// Database Connection Settings
$host = getenv('DB_HOST') ?: "localhost";
$user = getenv('DB_USER') ?: "root";
$pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : "";
$db   = getenv('DB_NAME') ?: "travel_buddy";
$port = getenv('DB_PORT') ? (int)getenv('DB_PORT') : 3306;

// Suppress mysqli fatal exceptions for clean JSON error responses
mysqli_report(MYSQLI_REPORT_OFF);

$conn = @new mysqli($host, $user, $pass, "", $port);

if ($conn->connect_error) {
    // If connection fails, keep $conn as null or object with error
    // Endpoints that require DB will check $conn and return clean JSON
} else {
    // Ensure database exists and select it
    $conn->query("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $conn->select_db($db);

    // 1. Users Table
    $conn->query("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 2. Planned Trips Table
    $conn->query("CREATE TABLE IF NOT EXISTS planned_trips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        image_res INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_destination (user_email, destination)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Check if older planned_trips table lacked user_email and patch it
    $chk = $conn->query("SHOW COLUMNS FROM planned_trips LIKE 'user_email'");
    if ($chk && $chk->num_rows === 0) {
        $conn->query("ALTER TABLE planned_trips ADD COLUMN user_email VARCHAR(255) NOT NULL DEFAULT '' AFTER id");
    }

    // 3. Trip Budgets Table
    $conn->query("CREATE TABLE IF NOT EXISTS trip_budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_title VARCHAR(255) NOT NULL UNIQUE,
        total_budget DECIMAL(10, 2) DEFAULT 0.00
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 4. Expenses Table
    $conn->query("CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_title VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        note VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 5. Community Posts Table
    $conn->query("CREATE TABLE IF NOT EXISTS community_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL,
        user_rating VARCHAR(100) NOT NULL,
        avatar_id INT NOT NULL DEFAULT 1,
        destination VARCHAR(255) NOT NULL,
        dates VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        interested_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 6. Join Requests Table
    $conn->query("CREATE TABLE IF NOT EXISTS join_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        requester_name VARCHAR(100) NOT NULL,
        requester_email VARCHAR(100) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 7. Packing List Table
    $conn->query("CREATE TABLE IF NOT EXISTS packing_list (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_title VARCHAR(255) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'General',
        is_packed TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 8. Alerts Table
    $conn->query("CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'general',
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

function checkDbConnection($conn) {
    if (!$conn || $conn->connect_error) {
        echo json_encode([
            "status" => "error",
            "message" => "Database connection unavailable. Please check if MySQL is running."
        ]);
        exit;
    }
}
?>
