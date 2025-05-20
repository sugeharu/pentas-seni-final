<?php
require_once 'config.php';
header('Content-Type: application/json');

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Handle different GET requests
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'search':
                    // Search students by name
                    if (isset($_GET['query'])) {
                        $query = $_GET['query'];
                        searchStudents($conn, $query);
                    } else {
                        echo json_encode(['error' => 'Missing search query']);
                    }
                    break;
                    
                case 'students_by_class':
                    // Get students by class
                    if (isset($_GET['class_id'])) {
                        $classId = $_GET['class_id'];
                        getStudentsByClass($conn, $classId);
                    } else {
                        echo json_encode(['error' => 'Missing class_id parameter']);
                    }
                    break;
                    
                case 'get_all_students':
                    // Get all students
                    getAllStudents($conn);
                    break;
                    
                case 'get_classes':
                    // Get all classes
                    getAllClasses($conn);
                    break;
                    
                case 'get_assigned_seats':
                    // Get all assigned seats
                    getAssignedSeats($conn);
                    break;
                    
                case 'get_attendance':
                    // Get all students with assigned seats
                    getAttendance($conn);
                    break;
                    
                default:
                    echo json_encode(['error' => 'Invalid action']);
                    break;
            }
        } else {
            echo json_encode(['error' => 'No action specified']);
        }
        break;
        
    case 'POST':
        // Handle different POST requests
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['action'])) {
            switch ($data['action']) {
                case 'assign_seat':
                    // Assign seat to student
                    if (isset($data['student_id']) && isset($data['seats'])) {
                        assignSeat($conn, $data['student_id'], $data['seats']);
                    } else {
                        echo json_encode(['error' => 'Missing required parameters']);
                    }
                    break;
                    
                case 'add_student':
                    // Add new student
                    if (isset($data['name']) && isset($data['class'])) {
                        addNewStudent($conn, $data['name'], $data['class']);
                    } else {
                        echo json_encode(['error' => 'Missing student data']);
                    }
                    break;
                    
                default:
                    echo json_encode(['error' => 'Invalid action']);
                    break;
            }
        } else {
            echo json_encode(['error' => 'No action specified']);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Invalid request method']);
        break;
}

// Function to search students by name
function searchStudents($conn, $query) {
    $query = "%$query%";
    $stmt = $conn->prepare("
        SELECT murid.id, murid.nama, kelas.nama_kelas 
        FROM murid 
        JOIN kelas ON murid.kelas_id = kelas.id 
        WHERE murid.nama LIKE ? 
        AND murid.id NOT IN (SELECT DISTINCT murid_id FROM bangku WHERE murid_id IS NOT NULL)
    ");
    $stmt->bind_param("s", $query);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $students = [];
    while ($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $students]);
}

// Function to get students by class
function getStudentsByClass($conn, $classId) {
    $stmt = $conn->prepare("
        SELECT murid.id, murid.nama
        FROM murid 
        WHERE murid.kelas_id = ? 
        AND murid.id NOT IN (SELECT DISTINCT murid_id FROM bangku WHERE murid_id IS NOT NULL)
    ");
    $stmt->bind_param("i", $classId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $students = [];
    while ($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $students]);
}

// Function to get all classes
function getAllClasses($conn) {
    $result = $conn->query("SELECT id, nama_kelas FROM kelas ORDER BY nama_kelas");
    
    $classes = [];
    while ($row = $result->fetch_assoc()) {
        $classes[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $classes]);
}

// Function to get all students
function getAllStudents($conn) {
    $result = $conn->query("
        SELECT murid.id, murid.nama, kelas.nama_kelas 
        FROM murid 
        JOIN kelas ON murid.kelas_id = kelas.id
    ");
    
    $students = [];
    while ($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $students]);
}

// Function to get all assigned seats
function getAssignedSeats($conn) {
    $result = $conn->query("
        SELECT bangku.nomor_bangku
        FROM bangku
        WHERE bangku.murid_id IS NOT NULL
    ");
    
    $seats = [];
    while ($row = $result->fetch_assoc()) {
        $seats[] = $row['nomor_bangku'];
    }
    
    echo json_encode(['success' => true, 'data' => $seats]);
}

// Function to assign seat to student
function assignSeat($conn, $studentId, $seats) {
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Update the seats to assign them to the student
        foreach ($seats as $seat) {
            $stmt = $conn->prepare("
                UPDATE bangku 
                SET murid_id = ? 
                WHERE nomor_bangku = ? AND murid_id IS NULL
            ");
            $stmt->bind_param("is", $studentId, $seat);
            $stmt->execute();
            
            // Check if seat was successfully assigned
            if ($stmt->affected_rows === 0) {
                // Rollback if any seat couldn't be assigned
                $conn->rollback();
                echo json_encode(['success' => false, 'message' => "Seat $seat is already taken"]);
                return;
            }
        }
        
        // Commit the transaction
        $conn->commit();
        
        // Get student information
        $stmt = $conn->prepare("
            SELECT murid.nama, kelas.nama_kelas 
            FROM murid 
            JOIN kelas ON murid.kelas_id = kelas.id 
            WHERE murid.id = ?
        ");
        $stmt->bind_param("i", $studentId);
        $stmt->execute();
        $result = $stmt->get_result();
        $student = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Seats assigned successfully',
            'data' => [
                'student' => $student,
                'seats' => $seats
            ]
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

// Function to add new student
function addNewStudent($conn, $name, $class) {
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Get class ID
        $stmt = $conn->prepare("SELECT id FROM kelas WHERE nama_kelas = ?");
        $stmt->bind_param("s", $class);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            $classId = $row['id'];
            
            // Check if student name already exists in the class
            $stmt = $conn->prepare("SELECT id FROM murid WHERE nama = ? AND kelas_id = ?");
            $stmt->bind_param("si", $name, $classId);
            $stmt->execute();
            
            if ($stmt->get_result()->num_rows > 0) {
                $conn->rollback();
                echo json_encode([
                    'success' => false,
                    'message' => 'Student already exists in this class'
                ]);
                return;
            }
            
            // Insert new student
            $stmt = $conn->prepare("INSERT INTO murid (nama, kelas_id) VALUES (?, ?)");
            $stmt->bind_param("si", $name, $classId);
            
            if ($stmt->execute()) {
                $newStudentId = $conn->insert_id;
                $conn->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Student added successfully',
                    'data' => [
                        'id' => $newStudentId,
                        'name' => $name,
                        'class' => $class
                    ]
                ]);
            } else {
                throw new Exception('Failed to add student');
            }
        } else {
            throw new Exception('Invalid class');
        }
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// Function to get attendance (students with assigned seats)
function getAttendance($conn) {
    $result = $conn->query("
        SELECT 
            murid.nama,
            kelas.nama_kelas,
            GROUP_CONCAT(bangku.nomor_bangku ORDER BY bangku.nomor_bangku SEPARATOR ' & ') as seats
        FROM 
            bangku
        JOIN 
            murid ON bangku.murid_id = murid.id
        JOIN 
            kelas ON murid.kelas_id = kelas.id
        WHERE 
            bangku.murid_id IS NOT NULL
        GROUP BY 
            murid.id
        ORDER BY 
            kelas.nama_kelas, murid.nama
    ");
    
    $attendance = [];
    while ($row = $result->fetch_assoc()) {
        $attendance[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $attendance]);
}
?>