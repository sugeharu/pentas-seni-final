document.addEventListener('DOMContentLoaded', function() {
    // Student data from database (will be fetched from PHP in real implementation)
    const studentsData = {
        'TK A1': [
            'Annasya', 'Aisyah', 'Malihah', 'Shafira', 'Zyana', 'Shanza', 'Emran', 
            'Esrshad', 'Rafa', 'Saki', 'Haikal', 'Aby', 'Kahfi', 'Haqqi', 'Arshaka'
        ],
        'TK A2': [
            'Eyza', 'Arshiyla', 'Azril', 'Fakhri', 'Selina', 'Jene', 
            'Zafran', 'Zahir', 'Zachry', 'Barra', 'Khawla', 'Arzan', 'Milka', 'Razzaz'
        ],
        'TK A3': [
            'Alma', 'Marzia', 'Devy', 'Naurah', 'Aqilla', 'Arra', 'Aiza', 
            'Khai', 'Altezza', 'Den', 'Cleo', 'Rakha', 'Razzaq', 'Rajasa'
        ],
        'TK A4': [
            'Abian', 'Zhea', 'Luffy', 'Dewi', 'Kalandra', 'Ghazi', 'Azka', 
            'Pradana', 'Rasya', 'Rania', 'Rifa', 'Luna', 'Hanif'
        ],
        'TK B1': [
            'Shanum', 'Khaula', 'Naima', 'Fatih', 'Alesha', 'Zidan', 'Kala',
            'Humaira', 'Malik', 'Mikayla', 'Nuno', 'Annisa', 'Birru', 'Shafiyya', 
            'Ghazi', 'Ruma', 'Aghnia'
        ],
        'TK B2': [
            'Fawwas', 'Bima', 'Alula', 'Rania', 'Keina', 'Arrumi', 'Sheeqa', 
            'Eza', 'Yumma', 'Hasna', 'Rafa', 'Uwais', 'Ghania', 'Shafiqa', 
            'Fidan', 'Athan', 'Aqmar'
        ],
        'TK B3': [
            'Keira', 'Khayla', 'Kallula', 'Filla', 'Ibna', 'Hamish', 'Umair', 
            'Ainaaz', 'Aftar', 'Bia', 'Ahnaf', 'Haza', 'Allea', 'Athaya', 'Ersya',
        ],
        'TK B4': [
            'Raffa', 'Alesha', 'Raiqa', 'Kirana', 'Sultan', 'Arrasya', 'Shakila', 'Maleeq', 
            'Nino', 'Mayla', 'Zia', 'Azka', 'Qirani', 'Naila', 'Keyko', 'Ayesha'
        ],
        'KB B1': [
            'Sakha', 'Abimanyu', 'Hizam', 'Ezhar', 'Gyan', 'Syanum', 'Hadid', 
            'Rumaisha', 'Kareem', 'Tarrak', 'Aisyah', 'Nabila'
        ],
        'KB B2': [
            'Eloise', 'Zahra', 'Renjana', 'Richie', 'Fatih', 'Razka', 'Shila', 
            'Farel', 'Nadhira', 'Awan', 'Biru', 'Vino'
        ]
    };

    // Available seats by rows
    const availableSeats = {
        'D': Array.from({length: 28}, (_, i) => `D${i+1}`),
        'E': Array.from({length: 30}, (_, i) => `E${i+1}`),
        'F': Array.from({length: 30}, (_, i) => `F${i+1}`),
        'G': Array.from({length: 32}, (_, i) => `G${i+1}`),
        'H': Array.from({length: 32}, (_, i) => `H${i+1}`),
        'I': Array.from({length: 32}, (_, i) => `I${i+1}`),
        'J': Array.from({length: 34}, (_, i) => `J${i+1}`),
        'K': Array.from({length: 34}, (_, i) => `K${i+1}`),
        'L': Array.from({length: 36}, (_, i) => `L${i+1}`)
    };

    // Student attendance and seat allocation
    let attendanceList = [];
    let allocatedSeats = [];

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

    // Add new student modal elements
    const addStudentBtn = document.getElementById('addStudentBtn');
    const addStudentModal = document.getElementById('addStudentModal');
    const closeAddStudent = document.getElementById('closeAddStudent');
    const addStudentForm = document.getElementById('addStudentForm');

    // Add to existing variables
    const blockModeBtn = document.getElementById('blockModeBtn');
    const blockModeInfo = document.getElementById('blockModeInfo');
    let blockMode = false;
    let blockedSeats = [];

    // Add to existing variables
    const toggleSeatsBtn = document.getElementById('toggleSeats');
    const seatContainer = document.getElementById('seatContainer');

    // Load blocked seats from localStorage
    if (localStorage.getItem('blockedSeats')) {
        blockedSeats = JSON.parse(localStorage.getItem('blockedSeats'));
    }

    // Initialize by fetching existing attendance data from server
    fetchAttendanceData();

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        if (searchTerm.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        searchResults.innerHTML = '';
        let resultsFound = false;

        Object.entries(studentsData).forEach(([className, students]) => {
            students.forEach(student => {
                if (student.toLowerCase().includes(searchTerm)) {
                    const resultItem = document.createElement('div');
                    resultItem.textContent = `${student} (${className})`;
                    resultItem.addEventListener('click', function() {
                        selectStudent(student, className);
                        searchInput.value = '';
                        searchResults.style.display = 'none';
                    });
                    searchResults.appendChild(resultItem);
                    resultsFound = true;
                }
            });
        });

        searchResults.style.display = resultsFound ? 'block' : 'none';
    });

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

    // Class buttons functionality
    classButtons.forEach(button => {
        button.addEventListener('click', function() {
            const className = this.getAttribute('data-class');
            openStudentSelection(className);
        });
    });

    // Close modal
    closeModal.addEventListener('click', function() {
        studentSelectionModal.style.display = 'none';
    });

    // Close notification
    closeNotification.addEventListener('click', function() {
        seatNotificationModal.style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === studentSelectionModal) {
            studentSelectionModal.style.display = 'none';
        }
        if (event.target === seatNotificationModal) {
            seatNotificationModal.style.display = 'none';
        }
        if (event.target === addStudentModal) {
            addStudentModal.style.display = 'none';
        }
    });

    // Show add student modal
    addStudentBtn.addEventListener('click', function() {
        addStudentModal.style.display = 'block';
    });

    // Close add student modal
    closeAddStudent.addEventListener('click', function() {
        addStudentModal.style.display = 'none';
    });

    // Toggle block mode
    blockModeBtn.addEventListener('click', function() {
        blockMode = !blockMode;
        this.classList.toggle('active');
        blockModeInfo.classList.toggle('show');
        this.textContent = blockMode ? 'Selesai Mode Blokir' : 'Mode Blokir Kursi';
        
        if (!blockMode) {
            // Save blocked seats when exiting block mode
            localStorage.setItem('blockedSeats', JSON.stringify(blockedSeats));
        }
    });

    // Add toggle seats functionality
    toggleSeatsBtn.addEventListener('click', function() {
        seatContainer.classList.toggle('hidden');
        toggleSeatsBtn.classList.toggle('hidden');
        toggleSeatsBtn.textContent = seatContainer.classList.contains('hidden') ? 
            'Tampilkan Denah' : 'Sembunyikan Denah';
    });

    // Function to add new student
    function addNewStudent(name, className) {
        // Add student to the studentsData object
        if (studentsData[className]) {
            studentsData[className].push(name);
            
            // Sort alphabetically
            studentsData[className].sort();

            // Immediately try to assign seats to the new student
            selectStudent(name, className);

            // Save to database
            saveNewStudent(name, className);
        }
    }

    // Function to save new student to database
    async function saveNewStudent(name, className) {
        try {
            const response = await fetch('database/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'add_student',
                    name: name,
                    class: className
                }),
            });

            const data = await response.json();
            
            if (!data.success) {
                console.error('Error saving student:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Modify the form submission handler
    addStudentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('newStudentName').value.trim();
        const className = document.getElementById('newStudentClass').value;
        
        if (!name || !className) {
            alert('Please fill in all fields');
            return;
        }

        // Add student to local data and assign seats
        addNewStudent(name, className);
        
        // Close modal and reset form
        addStudentModal.style.display = 'none';
        addStudentForm.reset();
    });

    // Function to open student selection modal
    function openStudentSelection(className) {
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.textContent = `Pilih Nama Anak ${className}`;
        
        studentsList.innerHTML = '';
        
        studentsData[className].forEach(student => {
            // Skip already registered students
            if (isStudentRegistered(student, className)) {
                return;
            }
            
            const studentCard = document.createElement('div');
            studentCard.className = 'student-card';
            studentCard.textContent = student;
            studentCard.addEventListener('click', function() {
                selectStudent(student, className);
                studentSelectionModal.style.display = 'none';
            });
            
            studentsList.appendChild(studentCard);
        });
        
        studentSelectionModal.style.display = 'block';
        studentsList.classList.add('fadeIn');
    }

    // Function to check if a student is already registered
    function isStudentRegistered(name, className) {
        return attendanceList.some(item => item.name === name && item.class === className);
    }

    // Function to select a student and allocate seats
    function selectStudent(name, className) {
        // Check if student already registered
        if (isStudentRegistered(name, className)) {
            alert(`${name} sudah terdaftar dan memiliki nomor bangku!`);
            return;
        }

        // Get two random available seats
        const seats = allocateSeats();
        
        if (seats.length !== 2) {
            alert('Maaf, tidak cukup kursi tersedia!');
            return;
        }

        // Register student with seats
        const studentData = {
            name: name,
            class: className,
            seats: seats
        };

        // Save to database via AJAX
        saveAttendance(studentData);
    }

    // Modify the allocateSeats function to skip blocked seats
    function allocateSeats() {
        const rows = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        let selectedSeats = [];

        for (let row of rows) {
            const availableSeatsInRow = availableSeats[row].filter(
                seat => !allocatedSeats.includes(seat) && !blockedSeats.includes(seat)
            );
            
            for (let i = 0; i < availableSeatsInRow.length - 1; i++) {
                if (parseInt(availableSeatsInRow[i].slice(1)) + 1 === parseInt(availableSeatsInRow[i + 1].slice(1))) {
                    selectedSeats.push(availableSeatsInRow[i], availableSeatsInRow[i + 1]);
                    allocatedSeats.push(availableSeatsInRow[i], availableSeatsInRow[i + 1]);
                    return selectedSeats;
                }
            }
        }
        return selectedSeats;
    }

    // Helper function to shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Function to save attendance data
    function saveAttendance(studentData) {
        // In a real implementation, this would be an AJAX call to the server
        // For now, we'll simulate a successful save
        
        // Add to local array
        attendanceList.push(studentData);
        
        // Update the UI
        updateAttendanceTable();
        showSeatNotification(studentData.seats);
        displaySeats(); // Update seat display

        // In real implementation, you would use AJAX:
        /*
        fetch('save_attendance.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                attendanceList.push(studentData);
                updateAttendanceTable();
                showSeatNotification(studentData.seats);
                displaySeats(); // Update seat display
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to save data. Please try again.');
        });
        */
    }

    // Function to show seat notification
    function showSeatNotification(seats) {
        seatNumber.textContent = seats.join(' & ');
        seatNotificationModal.style.display = 'block';
    }

    // Function to update the attendance table
    function updateAttendanceTable() {
        attendanceListElement.innerHTML = '';
        
        // Sort attendance list by seat numbers
        const sortedAttendance = attendanceList.sort((a, b) => {
            // Extract row letters and numbers from seats
            const aFirstSeat = a.seats[0];
            const bFirstSeat = b.seats[0];
            
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
            nameCell.textContent = student.name;
            
            const classCell = document.createElement('td');
            classCell.textContent = student.class;
            
            const seatsCell = document.createElement('td');
            seatsCell.textContent = student.seats.join(' & ');
            
            row.appendChild(nameCell);
            row.appendChild(classCell);
            row.appendChild(seatsCell);
            
            // Add class-specific styling
            row.classList.add(student.class.toLowerCase().replace(' ', '-'));
            
            attendanceListElement.appendChild(row);
        });
    }

    // Function to fetch attendance data from server
    function fetchAttendanceData() {
        // In a real implementation, this would be an AJAX call to the server
        // For now, we'll initialize with empty data
        
        // In real implementation, you would use AJAX:
        /*
        fetch('get_attendance.php')
        .then(response => response.json())
        .then(data => {
            attendanceList = data.attendance;
            allocatedSeats = [];
            
            // Extract all allocated seats
            attendanceList.forEach(student => {
                allocatedSeats.push(...student.seats);
            });
            
            updateAttendanceTable();
            displaySeats(); // Update seat display
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load attendance data.');
        });
        */
    }

    // Modify the displaySeats function
    function displaySeats() {
        const seatContainer = document.getElementById('seatContainer');
        seatContainer.innerHTML = '';

        Object.entries(availableSeats).forEach(([row, seats]) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'seat-row';

            seats.forEach(seat => {
                const seatElement = document.createElement('div');
                seatElement.className = 'seat';
                seatElement.innerText = seat;

                if (allocatedSeats.includes(seat)) {
                    seatElement.classList.add('occupied');
                } else if (blockedSeats.includes(seat)) {
                    seatElement.classList.add('blocked');
                }

                // Add click handler for blocking/unblocking seats
                seatElement.addEventListener('click', function() {
                    if (blockMode && !allocatedSeats.includes(seat)) {
                        if (blockedSeats.includes(seat)) {
                            // Unblock seat
                            blockedSeats = blockedSeats.filter(s => s !== seat);
                            seatElement.classList.remove('blocked');
                        } else {
                            // Block seat
                            blockedSeats.push(seat);
                            seatElement.classList.add('blocked');
                        }
                    }
                });

                rowElement.appendChild(seatElement);
            });

            seatContainer.appendChild(rowElement);
        });
    }

    // Call displaySeats on page load or when needed
    document.addEventListener('DOMContentLoaded', function() {
        fetchAttendanceData();
        displaySeats();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-section input');
    const searchButton = document.querySelector('.search-section button');
    const tableRows = document.querySelectorAll('table tr');

    searchButton.addEventListener('click', function() {
        const query = searchInput.value.toLowerCase();
        let found = false;

        tableRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const nameCell = cells[0]; // Assuming the name is in the first column
                if (nameCell.textContent.toLowerCase().includes(query)) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    row.classList.add('highlight');
                    found = true;
                } else {
                    row.classList.remove('highlight');
                }
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const attendanceList = document.getElementById('attendanceList');

    // Fetch students from the backend
    fetch('/students')
        .then(response => response.json())
        .then(data => {
            data.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.nama_siswa}</td>
                    <td>${student.nomor_kursi}</td>
                `;
                attendanceList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching students:', error));
});