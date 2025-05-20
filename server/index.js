document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const classButtons = document.querySelectorAll('.class-btn');
    const studentSelectionModal = document.getElementById('studentSelectionModal');
    const seatNotificationModal = document.getElementById('seatNotificationModal');
    const closeModal = document.querySelector('.close');
    const studentsList = document.getElementById('studentsList');
    const seatNumber = document.getElementById('seatNumber');
    const closeNotification = document.getElementById('closeNotification');
    const attendanceListElement = document.getElementById('attendanceList');
    const seatContainer = document.getElementById('seatContainer');

    // State management
    let allocatedSeats = [];
    let currentClassId = null;

    // Initialize by fetching data
    init();

    // Initialize application
    async function init() {
        await fetchClasses();
        await fetchAssignedSeats();
        await fetchAttendance();
        displaySeats();
    }

    // Fetch all classes
    async function fetchClasses() {
        try {
            const response = await fetch('api.php?action=get_classes');
            const data = await response.json();
            
            if (data.success) {
                setupClassButtons(data.data);
            } else {
                console.error('Error fetching classes:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Setup class buttons
    function setupClassButtons(classes) {
        classButtons.forEach(button => {
            const classCode = button.getAttribute('data-class');
            const classData = classes.find(c => c.nama_kelas === classCode);
            
            if (classData) {
                button.setAttribute('data-class-id', classData.id);
                button.addEventListener('click', function() {
                    currentClassId = classData.id;
                    openStudentSelection(classData.id, classData.nama_kelas);
                });
            }
        });
    }

    // Fetch assigned seats
    async function fetchAssignedSeats() {
        try {
            const response = await fetch('api.php?action=get_assigned_seats');
            const data = await response.json();
            
            if (data.success) {
                allocatedSeats = data.data;
            } else {
                console.error('Error fetching assigned seats:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Fetch attendance data
    async function fetchAttendance() {
        try {
            const response = await fetch('api.php?action=get_attendance');
            const data = await response.json();
            
            if (data.success) {
                updateAttendanceTable(data.data);
            } else {
                console.error('Error fetching attendance:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Search functionality
    searchInput.addEventListener('input', async function() {
        const searchTerm = this.value.trim();
        
        if (searchTerm.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`api.php?action=search&query=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            
            if (data.success) {
                displaySearchResults(data.data);
            } else {
                console.error('Error searching students:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Display search results
    function displaySearchResults(students) {
        searchResults.innerHTML = '';
        
        if (students.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        students.forEach(student => {
            const resultItem = document.createElement('div');
            resultItem.textContent = `${student.nama} (${student.nama_kelas})`;
            resultItem.addEventListener('click', function() {
                searchResults.style.display = 'none';
                searchInput.value = '';
                selectStudent(student.id, student.nama, student.nama_kelas);
            });
            searchResults.appendChild(resultItem);
        });

        searchResults.style.display = 'block';
    }

    // Show search button functionality
    searchButton.addEventListener('click', function() {
        if (searchInput.value.trim().length >= 2) {
            searchResults.style.display = searchResults.style.display === 'block' ? 'none' : 'block';
        }
    });

    // Hide search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && !searchButton.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Close modal buttons
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            studentSelectionModal.style.display = 'none';
        });
    }

    if (closeNotification) {
        closeNotification.addEventListener('click', function() {
            seatNotificationModal.style.display = 'none';
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === studentSelectionModal) {
            studentSelectionModal.style.display = 'none';
        }
        if (event.target === seatNotificationModal) {
            seatNotificationModal.style.display = 'none';
        }
    });

    // Function to open student selection modal
    async function openStudentSelection(classId, className) {
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.textContent = `Pilih Nama Anak ${className}`;
        
        try {
            const response = await fetch(`api.php?action=students_by_class&class_id=${classId}`);
            const data = await response.json();
            
            if (data.success) {
                populateStudentList(data.data);
                studentSelectionModal.style.display = 'block';
                studentsList.classList.add('fadeIn');
            } else {
                console.error('Error fetching students:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Populate student list in modal
    function populateStudentList(students) {
        studentsList.innerHTML = '';
        
        if (students.length === 0) {
            const noStudentsMessage = document.createElement('div');
            noStudentsMessage.className = 'no-students';
            noStudentsMessage.textContent = 'Semua siswa sudah mendapatkan kursi';
            studentsList.appendChild(noStudentsMessage);
            return;
        }

        students.forEach(student => {
            const studentCard = document.createElement('div');
            studentCard.className = 'student-card';
            studentCard.textContent = student.nama;
            studentCard.addEventListener('click', function() {
                studentSelectionModal.style.display = 'none';
                selectStudent(student.id, student.nama, currentClassId);
            });
            
            studentsList.appendChild(studentCard);
        });
    }

    // Function to select a student and allocate seats
    async function selectStudent(studentId, studentName, studentClass) {
        // Allocate two adjacent seats
        const seats = allocateAdjacentSeats();
        
        if (seats.length !== 2) {
            alert('Maaf, tidak cukup kursi tersedia!');
            return;
        }

        try {
            const response = await fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'assign_seat',
                    student_id: studentId,
                    seats: seats
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update local data
                allocatedSeats = [...allocatedSeats, ...seats];
                
                // Show notification
                showSeatNotification(seats);
                
                // Refresh attendance list and seats display
                await fetchAttendance();
                displaySeats();
            } else {
                alert(`Error: ${data.message}`);
                // Refresh the allocated seats in case of conflict
                await fetchAssignedSeats();
                displaySeats();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to assign seats. Please try again.');
        }
    }

    // Function to allocate two adjacent seats
    function allocateAdjacentSeats() {
        const rows = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        
        // For each row
        for (let row of rows) {
            // Get all seats in the row from the database
            const seatsInRow = [];
            for (let i = 1; i <= 36; i++) {
                seatsInRow.push(`${row}${i}`);
            }
            
            // Filter out already allocated seats
            const availableSeats = seatsInRow.filter(seat => !allocatedSeats.includes(seat));
            
            // Find adjacent seats
            for (let i = 0; i < availableSeats.length - 1; i++) {
                const currentSeat = availableSeats[i];
                const nextSeat = availableSeats[i + 1];
                
                // Extract numbers from seat codes
                const currentNum = parseInt(currentSeat.substring(1));
                const nextNum = parseInt(nextSeat.substring(1));
                
                // Check if they're adjacent
                if (nextNum === currentNum + 1) {
                    return [currentSeat, nextSeat];
                }
            }
        }
        
        return [];
    }

    // Function to show seat notification
    function showSeatNotification(seats) {
        seatNumber.textContent = seats.join(' & ');
        seatNotificationModal.style.display = 'block';
    }

    // Function to update the attendance table
    function updateAttendanceTable(attendance) {
        attendanceListElement.innerHTML = '';
        
        // Sort attendance by seat numbers
        const sortedAttendance = attendance.sort((a, b) => {
            // Extract first seat numbers for comparison
            const [aFirstSeat] = a.seats.split(' & ');
            const [bFirstSeat] = b.seats.split(' & ');
            
            // Extract row letter (e.g., 'D' from 'D1')
            const aRow = aFirstSeat.charAt(0);
            const bRow = bFirstSeat.charAt(0);
            
            // If rows are different, sort by row
            if (aRow !== bRow) {
                return aRow.localeCompare(bRow);
            }
            
            // If rows are same, sort by seat number
            const aNum = parseInt(aFirstSeat.substring(1));
            const bNum = parseInt(bFirstSeat.substring(1));
            return aNum - bNum;
        });
        
        sortedAttendance.forEach(student => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = student.nama;
            
            const classCell = document.createElement('td');
            classCell.textContent = student.nama_kelas;
            
            const seatsCell = document.createElement('td');
            seatsCell.textContent = student.seats;
            
            row.appendChild(nameCell);
            row.appendChild(classCell);
            row.appendChild(seatsCell);
            
            attendanceListElement.appendChild(row);
        });
    }

    // Function to display seats and mark occupied ones
    function displaySeats() {
        if (!seatContainer) return;
        
        seatContainer.innerHTML = '';
        
        // Define rows and max seats per row
        const rows = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        const maxSeatsPerRow = {
            'D': 28, 'E': 30, 'F': 30, 'G': 32, 'H': 32, 
            'I': 32, 'J': 34, 'K': 34, 'L': 36
        };
        
        rows.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.className = 'seat-row';
            
            for (let i = 1; i <= maxSeatsPerRow[row]; i++) {
                const seatCode = `${row}${i}`;
                const seatElement = document.createElement('div');
                seatElement.className = 'seat';
                seatElement.textContent = seatCode;
                
                // Mark seat as occupied if in allocatedSeats array
                if (allocatedSeats.includes(seatCode)) {
                    seatElement.classList.add('occupied');
                }
                
                rowElement.appendChild(seatElement);
            }
            
            seatContainer.appendChild(rowElement);
        });
    }
});