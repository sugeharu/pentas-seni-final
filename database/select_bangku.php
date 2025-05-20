<!-- <?php
include 'config.php';

$murid_id = $_POST['murid_id'];
$nomor_bangku = $_POST['nomor_bangku'];

// Cek apakah bangku sudah dipilih
$sql = "SELECT * FROM bangku WHERE nomor_bangku = '$nomor_bangku'";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    // Jika belum dipilih, simpan ke database
    $sql = "INSERT INTO bangku (murid_id, nomor_bangku) VALUES ($murid_id, '$nomor_bangku')";
    if ($conn->query($sql) === TRUE) {
        echo "Bangku berhasil dipilih: " . $nomor_bangku;
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} else {
    echo "Bangku sudah dipilih.";
}

$conn->close();
?> -->