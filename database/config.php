<?php
// Database connection configuration
$host = "localhost";
$username = "root";
$password = "";
$database = "pentas_seni_2025";

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set character set
mysqli_set_charset($conn, "utf8mb4");
?>