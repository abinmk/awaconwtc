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
let currentPageTemp=1;
const totalDatasets = 30; // Total number of datasets
let liveDistance = 0;

// Function to fetch data for the current page and populate the corresponding table
function fetchDataForCurrentPage() {
  showLoader();
  // Hide all tables first


  const table = document.getElementById("data");
  const tbody = table.getElementsByTagName('tbody')[0];
  tbody.innerHTML = ''; // Clear previous data
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
var fm = new FluidMeter();
fm.init({
  targetContainer: document.getElementById("fluid-meter"),
  fillPercentage: 15,
  options: {
    fontSize: "70px",
    fontFamily: "Arial",
    fontFillStyle: "white",
    drawShadow: true,
    drawText: true,
    drawPercentageSign: true,
    drawBubbles: true,
    size: 350,
    borderWidth: 25,
    backgroundColor: "#e2e2e2",
    foregroundColor: "#fafafa",
    foregroundFluidLayer: {
      fillStyle: "#0096FF",
      angularSpeed: 100,
      maxAmplitude: 12,
      frequency: 30,
      horizontalSpeed: -150
    },
    backgroundFluidLayer: {
      fillStyle: "lightblue",
      angularSpeed: 180,
      maxAmplitude: 10,
      frequency: 30,
      horizontalSpeed: 150
    }
  }
});

// Function to select a specific page (dataset)
function selectPage(page) {
  currentPage = page;
  document.getElementById('dataCycle').innerHTML = `Data Cycle: ${page}`;
  fetchDataForCurrentPage(); // Fetch data for the selected page
  showChart();
  showLiveData();
  
  
}


// Function to format timestamp to date
function formatDate(timestamp) {
  // Create a new Date object by subtracting 5 hours and 30 minutes from the timestamp (multiplied by 1000 to convert seconds to milliseconds)
  const date = new Date((timestamp - (5 * 3600 + 30 * 60)) * 1000);

  // Extract year, month, and day from the adjusted date object
  const year = date.getFullYear(); // Get the full year (e.g., 2024)
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get the month (0-indexed, so add 1) and pad with leading zeros if needed (e.g., 02 for February)
  const day = date.getDate().toString().padStart(2, '0'); // Get the day of the month and pad with leading zeros if needed (e.g., 07 for the 7th day)

  // Return the formatted date string in "DD-MM-YYYY" format
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

// function exportToExcel() {
//   var wb = XLSX.utils.book_new();

//   // Iterate over each table
//   document.querySelectorAll('.dataTable').forEach((table, index) => {
//     // Get the table data
//     var ws = XLSX.utils.table_to_sheet(table);
    
//     // Set the sheet name based on the table ID
//     var sheetName = `Data${index + 1}`;
//     XLSX.utils.book_append_sheet(wb, ws, sheetName);
//   });

//   // Export the workbook to Excel file
//   XLSX.writeFile(wb, "Awacon_Sensor_Data.xlsx");
// }
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
  document.getElementById('chartContainer').style.display = 'block';
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
  // document.getElementById('showChartButton').innerHTML="Hide Chart";
  scrollToBottom();
}

// Event listener for the button click
function showChart() {
  const chartContainer = document.getElementById('chartContainer');
  
  // Check if chart container exists
  if (!chartContainer) {
    console.error('Chart container not found in the DOM');
    return;
  }
    const databaseRef = firebase.database().ref(`UsersData/4P7aUzvuI8RM0Pb2dPACF3V9SCz2/readings/Day${currentPage}`);
    databaseRef.once('value')
      .then(snapshot => {
        const distanceData = snapshot.val();
      if(distanceData==null)
      {
        alert("No data found for the page:"+currentPage);
        // document.getElementById('showChartButton').innerHTML="Show Chart";
        return;
      }
        createChart(distanceData); // Call the function to create the chart
      })
      .catch(error => { 
        console.error('Error fetching data from Firebase:', error);
      });
  }


function reloadData() {
  selectPage(currentPage);
}

function scrollToBottom() {
  const tbody = document.getElementById("data").getElementsByTagName('tbody')[0];
  tbody.scrollTop = tbody.scrollHeight;
}

// Function to export all datasets to Excel
function exportToExcel() {
  currentPageTemp = currentPage;
  var wb = XLSX.utils.book_new();
  totalSheets = 0; // Reset totalSheets variable

  // Iterate over each dataset
  for (let i = 1; i <= totalDatasets; i++) {
    const databaseRef = firebase.database().ref(`UsersData/4P7aUzvuI8RM0Pb2dPACF3V9SCz2/readings/Day${i}`);
    databaseRef.once('value')
      .then(snapshot => {
        const distanceData = snapshot.val();
        if (distanceData) {
          const sheetName = `Data${i}`;
          const sheetData = convertDataToSheet(distanceData);
          if (sheetData) {
            XLSX.utils.book_append_sheet(wb, sheetData, sheetName);
            totalSheets++; // Increment totalSheets for each added sheet
          }
        else{
          // Export the workbook to Excel file after processing all datasets
          XLSX.writeFile(wb, "Awacon_Sensor_Data.xlsx");
          console.log(`Total sheets exported: ${totalSheets}`);
         
        }
      }})
      .catch(error => { 
        console.error('Error fetching data from Firebase:', error);
      });
  }
}

// Function to convert table data to sheet format
function convertDataToSheet() {
  const sheet = {};
  const table = document.getElementById('data'); // Assuming the table ID is 'data'
  const rows = table.querySelectorAll('tbody tr');

  for(let i=1;i<31;i++)
  {
    selectPage(i);
  // Construct a two-dimensional array containing table data
  const data = Array.from(rows).map(row => {
    return Array.from(row.cells).map(cell => cell.textContent);
  });
  // Add the data to the sheet
  XLSX.utils.sheet_add_aoa(sheet, data);
  }
  return sheet;
}




function showLiveData()
{
// Get a database reference to our posts
const databaseRef = firebase.database().ref(`UsersData/4P7aUzvuI8RM0Pb2dPACF3V9SCz2/readings/Day${currentPage}`);
// Listen for any new data added to the database
databaseRef.on('child_added', snapshot => {
    // Handle the new data here
    const newData = snapshot.val();
    console.log('New data added:', newData);
    document.getElementById("liveDate").innerHTML = rotateDateFormat(formatDate(newData.Timestamp));
    document.getElementById("liveTime").innerHTML = formatTime(newData.Timestamp);
    document.getElementById("liveDistance").innerHTML = newData.Distance;
    liveDistance = newData.Distance;
    fm.setPercentage(mapToPercentage(liveDistance,25, 75));
    
});
}


function mapToPercentage(value, min, max) {
  // Ensure value is within the range [min, max]
  value = Math.max(min, Math.min(max, value));
  
  // Map the value to percentage
  let percentage = 100 - ((value - min) / (max - min)) * 100;
  
  return percentage;
}