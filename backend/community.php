<?php
require_once 'db_config.php';
checkDbConnection($conn);

$data = getRequestData();
$action = $data['action'] ?? 'get';

if ($action === 'get') {
    $result = $conn->query("SELECT id, user_name, user_rating, avatar_id, destination, dates, description, interested_count FROM community_posts ORDER BY created_at DESC");
    $posts = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $posts[] = [
                "id" => (int)$row['id'],
                "user_name" => $row['user_name'],
                "user_rating" => $row['user_rating'],
                "avatar_id" => (int)$row['avatar_id'],
                "destination" => $row['destination'],
                "dates" => $row['dates'],
                "description" => $row['description'],
                "interested_count" => (int)$row['interested_count']
            ];
        }
    }
    echo json_encode(["status" => "success", "data" => $posts]);
    exit;
}

if ($action === 'add') {
    $user_name = trim($data['user_name'] ?? 'Traveler');
    $destination = trim($data['destination'] ?? '');
    $dates = trim($data['dates'] ?? '');
    $description = trim($data['description'] ?? '');
    $avatar_id = rand(1, 5);
    $user_rating = "4." . rand(5, 9) . " Traveler Rating";

    if (empty($destination) || empty($description)) {
        echo json_encode(["status" => "error", "message" => "Destination and description are required"]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO community_posts (user_name, user_rating, avatar_id, destination, dates, description) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssisss", $user_name, $user_rating, $avatar_id, $destination, $dates, $description);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Post added successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to add post: " . $stmt->error]);
    }
    $stmt->close();
    exit;
}

if ($action === 'join') {
    $id = (int)($data['id'] ?? 0);
    $requester_name = trim($data['requester_name'] ?? '');
    $requester_email = trim($data['requester_email'] ?? '');

    if ($id <= 0 || empty($requester_name) || empty($requester_email)) {
        echo json_encode(["status" => "error", "message" => "Post ID, requester name, and email are required"]);
        exit;
    }

    $post_stmt = $conn->prepare("SELECT destination FROM community_posts WHERE id = ?");
    $post_stmt->bind_param("i", $id);
    $post_stmt->execute();
    $post_res = $post_stmt->get_result();
    
    if ($post_res->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Post not found"]);
        $post_stmt->close();
        exit;
    }
    $post_data = $post_res->fetch_assoc();
    $destination = $post_data['destination'];
    $post_stmt->close();

    // Insert into join_requests table
    $stmt = $conn->prepare("INSERT INTO join_requests (post_id, requester_name, requester_email, destination) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $id, $requester_name, $requester_email, $destination);
    $stmt->execute();
    $stmt->close();

    // Update community_posts interested count
    $conn->query("UPDATE community_posts SET interested_count = interested_count + 1 WHERE id = $id");

    echo json_encode(["status" => "success", "message" => "Joined successfully"]);
    exit;
}

if ($action === 'get_requests') {
    $owner_name = trim($data['owner_name'] ?? '');
    if (empty($owner_name)) {
        echo json_encode(["status" => "error", "message" => "Owner name is required"]);
        exit;
    }

    $stmt = $conn->prepare("
        SELECT jr.id, jr.post_id, jr.requester_name, jr.requester_email, jr.destination, jr.status 
        FROM join_requests jr
        JOIN community_posts cp ON jr.post_id = cp.id
        WHERE cp.user_name = ? AND jr.status = 'pending'
        ORDER BY jr.created_at DESC
    ");
    $stmt->bind_param("s", $owner_name);
    $stmt->execute();
    $result = $stmt->get_result();

    $requests = [];
    while ($row = $result->fetch_assoc()) {
        $requests[] = [
            "id" => (int)$row['id'],
            "post_id" => (int)$row['post_id'],
            "requester_name" => $row['requester_name'],
            "requester_email" => $row['requester_email'],
            "destination" => $row['destination'],
            "status" => $row['status']
        ];
    }
    $stmt->close();
    echo json_encode(["status" => "success", "data" => $requests]);
    exit;
}

if ($action === 'respond_request') {
    $request_id = (int)($data['request_id'] ?? 0);
    $status = trim($data['status'] ?? ''); // 'accepted' or 'declined'

    if ($request_id <= 0 || !in_array($status, ['accepted', 'declined'])) {
        echo json_encode(["status" => "error", "message" => "Invalid parameters"]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE join_requests SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $request_id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Request updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update request: " . $stmt->error]);
    }
    $stmt->close();
    exit;
}

if ($action === 'edit') {
    $id = (int)($data['id'] ?? 0);
    $destination = trim($data['destination'] ?? '');
    $dates = trim($data['dates'] ?? '');
    $description = trim($data['description'] ?? '');

    if ($id <= 0 || empty($destination) || empty($description)) {
        echo json_encode(["status" => "error", "message" => "All fields are required"]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE community_posts SET destination = ?, dates = ?, description = ? WHERE id = ?");
    $stmt->bind_param("sssi", $destination, $dates, $description, $id);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Post updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update post"]);
    }
    $stmt->close();
    exit;
}

if ($action === 'delete') {
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(["status" => "error", "message" => "Invalid post ID"]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM community_posts WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Post deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete post"]);
    }
    $stmt->close();
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid action specified"]);
$conn->close();
?>
