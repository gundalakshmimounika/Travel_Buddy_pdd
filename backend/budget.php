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
    // Get budget limit
    $stmt = $conn->prepare("SELECT total_budget FROM trip_budgets WHERE trip_title = ?");
    $stmt->bind_param("s", $trip);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $budget = $row ? (float)$row['total_budget'] : 0.0;
    $stmt->close();

    // Get expenses list
    $stmt = $conn->prepare("SELECT id, trip_title, amount, note, created_at FROM expenses WHERE trip_title = ? ORDER BY created_at DESC");
    $stmt->bind_param("s", $trip);
    $stmt->execute();
    $res = $stmt->get_result();
    $expenses = [];
    while ($r = $res->fetch_assoc()) {
        $expenses[] = [
            "id" => (int)$r['id'],
            "trip_title" => $r['trip_title'],
            "amount" => (float)$r['amount'],
            "note" => $r['note'],
            "created_at" => $r['created_at']
        ];
    }
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "total_budget" => $budget,
        "expenses" => $expenses
    ]);
    exit;
} elseif ($action === 'set_limit') {
    $limit = (float)($data['limit'] ?? 0);
    $stmt = $conn->prepare("INSERT INTO trip_budgets (trip_title, total_budget) VALUES (?, ?) ON DUPLICATE KEY UPDATE total_budget = ?");
    $stmt->bind_param("sdd", $trip, $limit, $limit);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Budget limit set successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update budget limit"]);
    }
    $stmt->close();
    exit;
} elseif ($action === 'add_expense') {
    $amount = (float)($data['amount'] ?? 0);
    $note = trim($data['note'] ?? '');
    if ($amount <= 0) {
        echo json_encode(["status" => "error", "message" => "Valid expense amount is required"]);
        exit;
    }
    $stmt = $conn->prepare("INSERT INTO expenses (trip_title, amount, note) VALUES (?, ?, ?)");
    $stmt->bind_param("sds", $trip, $amount, $note);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Expense added successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to add expense"]);
    }
    $stmt->close();
    exit;
} elseif ($action === 'delete_expense') {
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(["status" => "error", "message" => "Valid expense ID is required"]);
        exit;
    }
    $stmt = $conn->prepare("DELETE FROM expenses WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Expense deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete expense"]);
    }
    $stmt->close();
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid action specified"]);
$conn->close();
?>
