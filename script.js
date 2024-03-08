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
  let prevDistance=0;
  databaseRef.once('value')
    .then(snapshot => {
      snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        const row = tbody.insertRow();
        const formattedDate = rotateDateFormat(formatDate(data.Timestamp));
        let currentDistance = parseInt(data.Distance);
        let difference = prevDistance !== null ? Math.abs(currentDistance - prevDistance) : null;
        row.innerHTML = `
          <td>${slNo++}</td>
          <td>${formattedDate}</td>
          <td>${formatTime(data.Timestamp)}</td>
          <td class="row" id="distanceCell">${data.Distance} cm</td>
          <td id="diff">${difference} cm</td>
          <td id="motorStatus">${"NA"}</td>
        `;
        const distanceCell = row.querySelector('#distanceCell');
        const diff = row.querySelector('#diff');
        const motorStatus = row.querySelector('#motorStatus'); // Select motorStatus cell

        if (data.Distance === "ERR_PWR") {
            prevDistance=0;
            distanceCell.style.backgroundColor = "red";
            distanceCell.innerHTML = "ERR_PWR";
            distanceCell.style.color = "white";
            diff.innerHTML = "NA";
        }
        if(prevDistance==0 || prevDistance==null)
        {
          diff.innerHTML = "NA";
        }

        if (data.Distance >75) {
          distanceCell.style.backgroundColor = "yellow";
          distanceCell.style.color = "black";
          motorStatus.innerHTML = "~ON";
      }
      if (data.Distance <25) {
        distanceCell.style.backgroundColor = "lightgreen";
        distanceCell.style.color = "black";
        motorStatus.innerHTML = "~OFF";
    }
    if (difference >=10) {
      diff.style.backgroundColor = "yellow";
      distanceCell.style.color = "black";
  }
    prevDistance = currentDistance;
      });
      hideLoader();
    })
    .catch(error => {
      console.error('Error fetching data:', error); 
    });
   
}

// function setDelayToFirebase() {
//   const delayInput = document.getElementById('delayInput');
//   const delayValue = delayInput.value;

//   if (!delayValue) {
//     alert("Please enter a delay value");
//     return;
//   }

//   const delayRef = firebase.database().ref('UsersData/4P7aUzvuI8RM0Pb2dPACF3V9SCz2/readings/DataSetSL/Delay');

//   // Set the delay value to Firebase
//   delayRef.set(parseInt(delayValue))
//     .then(() => {
//       console.log("Delay value has been set successfully");
//     })
//     .catch(error => {
//       console.error("Error setting delay value:", error);
//     });
// }


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
  chartContainer.style.display = 'none'; // Hide chart container
  document.getElementById('showChartButton').innerHTML="Show Chart";
  document.getElementById('msg').style.display="none";
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


// Function to create the chart
function createChart(data) {
  const timestamps = Object.keys(data);
  const distances = Object.values(data).map(entry => entry.Distance);
  const ctx = document.getElementById('distanceChart').getContext('2d');

  // Check if a chart instance already exists
  if (window.distanceChart && typeof window.distanceChart.destroy === 'function') {
    window.distanceChart.destroy(); // Destroy the existing chart instance
  }

  // Create a new chart instance
  window.distanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: [{
        label: 'Distance',
        data: distances,
        borderColor: 'blue',
        backgroundColor: 'transparent',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: 'Distance (cm)'
          }
        }
      }
    }
  });

  document.getElementById('chartContainer').style.display = 'block';
  document.getElementById('showChartButton').innerHTML="Hide Chart";
  document.getElementById('msg').style.display="block";
}

// Event listener for the button click
document.getElementById('showChartButton').addEventListener('click', () => {
  const chartContainer = document.getElementById('chartContainer');
  
  // Check if chart container exists
  if (!chartContainer) {
    console.error('Chart container not found in the DOM');
    return;
  }

  // Toggle chart container visibility
  if (chartContainer.style.display === 'block') {
    chartContainer.style.display = 'none'; // Hide chart container
    document.getElementById('msg').style.display="none";
    document.getElementById('showChartButton').innerHTML="Show Chart";
    // chartContainer.remove(); // Optionally remove the chart container from the DOM
  } else {
    // Fetch data from Firebase
    chartContainer.style.display = 'block';
    const databaseRef = firebase.database().ref(`UsersData/4P7aUzvuI8RM0Pb2dPACF3V9SCz2/readings/Day${currentPage}`);
    databaseRef.once('value')
      .then(snapshot => {
        const distanceData = snapshot.val();
      if(distanceData==null)
      {
        alert("No data found for the page:"+currentPage);
        chartContainer.style.display = 'none'; // Hide chart container
        document.getElementById('msg').style.display="none";
        document.getElementById('showChartButton').innerHTML="Show Chart";
        return;
      }
      else
        createChart(distanceData); // Call the function to create the chart
      })
      .catch(error => { 
        console.error('Error fetching data from Firebase:', error);
      });
  }
});

