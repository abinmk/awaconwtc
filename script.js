const firebaseConfig = {
  apiKey: "AIzaSyBn2mbRAikL5ZfiQcf9sn-qfsng4NoOBeU",
  authDomain: "awaconwtc.firebaseapp.com",
  databaseURL: "https://awaconwtc-default-rtdb.firebaseio.com",
  projectId: "awaconwtc",
  storageBucket: "awaconwtc.appspot.com",
  messagingSenderId: "1095771274237",
  appId: "1:1095771274237:web:66fc399a5415caa5bf3794",
  measurementId: "G-6ZH7287GQF"
};


firebase.initializeApp(firebaseConfig);

let currentPage = 1; // Default current page
const totalDatasets = 4; // Total number of datasets

// Function to fetch data for the current page and populate the corresponding table
function fetchDataForCurrentPage() {
  showLoader();
  // Hide all tables first
  document.querySelectorAll('.dataTable').forEach(table => {
    table.style.display = 'none';
  });

  const tableId = `data${currentPage}`;
  const table = document.getElementById(tableId);
  const tbody = table.getElementsByTagName('tbody')[0];
  tbody.innerHTML = ''; // Clear previous data
  table.style.display = ''; // Show the table for the current page

  const databaseRef = firebase.database().ref(`UsersData/4P7aUzvuI8RM0Pb2dPACF3V9SCz2/readings/Day${currentPage}`);
  let slNo=1;
  databaseRef.once('value')
    .then(snapshot => {
      snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        const row = tbody.insertRow();
        const formattedDate = rotateDateFormat(formatDate(data.Timestamp));
        row.innerHTML = `
          <td>${slNo++}</td>
          <td>${formattedDate}</td>
          <td>${formatTime(data.Timestamp)}</td>
          <td>${data.Distance} cm</td>
          <td>${data.Difference} cm</td>
          <td>${data.Pressure}</td>
        `;
      });
      hideLoader();
    })
    .catch(error => {
      console.error('Error fetching data:', error); 
    });
   
}

function rotateDateFormat(dateString) {
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    return `${mm} ${dd} ${yyyy}`;
  } else {
    return dateString; // Return original string if not in expected format
  }
}


// Function to select a specific page (dataset)
function selectPage(page) {
  
  currentPage = page;
  document.getElementById('dataCycle').innerHTML = `Data cycle: ${page}`;
  fetchDataForCurrentPage(); // Fetch data for the selected page
  
  
}


// Function to format timestamp to date
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${day}-${month}-${year}`;
}

// Function to format timestamp to time
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  date.setHours(date.getHours() - 5); // Add 5 hours
  date.setMinutes(date.getMinutes() - 30); // Add 30 minutes
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function exportToExcel() {
  var wb = XLSX.utils.book_new();

  // Iterate over each table
  document.querySelectorAll('.dataTable').forEach((table, index) => {
    // Get the table data
    var ws = XLSX.utils.table_to_sheet(table);
    
    // Set the sheet name based on the table ID
    var sheetName = `Data${index + 1}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  // Export the workbook to Excel file
  XLSX.writeFile(wb, "Awacon_Sensor_Data.xlsx");
}
// Function to show loader
function showLoader() {
  document.getElementById('loader-overlay').style.display = 'flex';
}

// Function to hide loader
function hideLoader() {
  document.getElementById('loader-overlay').style.display = 'none';
}


