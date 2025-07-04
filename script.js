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

let currentPage = 30; // Default current page
let currentPageTemp=1;
const totalDatasets = 30; // Total number of datasets
let liveDistance = 0;
let user ='abin';

let distanceChart;
let chartInitialized = false;

function initializeChart() {
  const ctx = document.getElementById('distanceChart').getContext('2d');

  distanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Distance (cm)',
        data: [],
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        borderWidth: 2,
        tension: 0.3, // Smooth lines
        pointRadius: 3,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false
        },
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Real-Time Distance Chart'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Timestamp'
          },
          grid: {
            display: true
          }
        },
        y: {
          title: {
            display: true,
            text: 'Distance (cm)'
          },
          grid: {
            display: true
          }
        }
      }
    }
  });

  chartInitialized = true;
}

function startRealtimeChart(systemId, currentPage) {
  if (!chartInitialized) {
    initializeChart();
  }

  const dataRef = firebase.database().ref(`TESTING/WTC/${systemId}/DATA/DAY_${currentPage}`);

  dataRef.on('child_added', snapshot => {
    const key = snapshot.key;
    const value = snapshot.val();

    // Avoid duplicates
    if (!distanceChart.data.labels.includes(key)) {
      distanceChart.data.labels.push(key);
      distanceChart.data.datasets[0].data.push(value.DISTANCE || 0);
      distanceChart.update();
    }
  });
}



// Function to fetch data for the current page and populate the corresponding table
function fetchDataForCurrentPage() {
  showLoader();

  const table = document.getElementById("data");
  const tbody = table.getElementsByTagName('tbody')[0];
  tbody.innerHTML = ''; // Clear previous data

  const databaseRef = firebase.database().ref(`TESTING/WTC/WTC_BX_44fdeb/DATA/DAY_${currentPage}`);
  let slNo = 1;
  let prevDistance = 0;

  databaseRef.once('value')
    .then(snapshot => {
      snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        const row = tbody.insertRow();
        const formattedDate = rotateDateFormat(formatDate(data.TIMESTAMP));
        let currentDistance = parseInt(data.DISTANCE);
        let difference = prevDistance !== null ? Math.abs(currentDistance - prevDistance) : null;

        // Set row content using class names
        row.innerHTML = `
          <td>${slNo++}</td>
          <td>${formattedDate}</td>
          <td>${formatTime(data.TIMESTAMP)}</td>
          <td class="distanceCell">${data.DISTANCE} cm</td>
          <td>${data.LIVE_DISTANCE} cm</td>
          <td class="diff">${difference} cm</td>
          <td>${data.DRYRUN_STATUS} </td>
          <td>${data.HIGH_POINT} cm</td>
          <td>${data.LOW_POINT} cm</td>
          <td class="motorStatus">${data.MOTOR_STATUS}</td>
        `;

        // Select the correct elements using class
        const distanceCell = row.querySelector('.distanceCell');
        const diff = row.querySelector('.diff');
        const motorStatus = row.querySelector('.motorStatus');

        if (!distanceCell || !diff || !motorStatus) return; // Safety check

        // Handle error case
        if (data.DISTANCE === "ERR_PWR") {
          prevDistance = 0;
          distanceCell.style.backgroundColor = "red";
          distanceCell.innerHTML = "ERR_PWR";
          distanceCell.style.color = "white";
          diff.innerHTML = "NA";
        } else {
          if (data.DISTANCE > 75) {
            distanceCell.style.backgroundColor = "yellow";
            distanceCell.style.color = "black";
            motorStatus.innerHTML = "~ON";
          } else if (data.DISTANCE < 15) {
            distanceCell.style.backgroundColor = "lightgreen";
            distanceCell.style.color = "black";
            motorStatus.innerHTML = "~OFF";
          }

          // Highlight differences
          if (difference >= 10) {
            diff.style.backgroundColor = "red";
          } else if (difference >= 5) {
            diff.style.backgroundColor = "orange";
          } else if (difference >= 1) {
            diff.style.backgroundColor = "blue";
          }

          if (difference >= 1) {
            diff.style.color = "white";
            diff.style.fontWeight = "bold";
          }
        }

        prevDistance = currentDistance;
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

selectPage(0,'ABIN M K');

// Function to select a specific page (dataset)
function selectPage(page,username) {
  document.getElementById('entryScreen').style.display ="none";
  document.getElementById('mainContent').style.display ="block";
  switch(username)
  {
    case "ABIN M K" : user = 'abin';break;
    case "ULSAH U S" : user = 'ulsah';break;
    case "ASWIN C P" : user = 'aswin';break;
    case "ROHITH C M" : user = 'rohith';break;
    case "ATHUL P" : user = 'athul';break;
    case "ABHISHEK PAVITHRAN" : user = 'abhishek';break;
    case "NA" : break;
  }
  console.log(user);
  // Create a new Date object
let currentDate = new Date();
// Get the year, month, and day components from the Date object
let year = currentDate.getFullYear();
let month = currentDate.getMonth() + 1; // Months are zero-indexed, so add 1
let day = currentDate.getDate();

if(page==0)
{
  page = day;
}
  currentPage = page;
  if(username!="NA")
  document.getElementById('userDisplay').innerHTML = username;
  fetchDataForCurrentPage(); // Fetch data for the selected page
  showChart();
  showLiveData();
  document.getElementById('dataCycle').innerHTML = `Data Cycle: ${page}`;
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
  const distances = Object.values(data).map(entry => entry.DISTANCE);
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
function selectUser(){
  document.getElementById('entryScreen').style.display ="flex";
  document.getElementById('mainContent').style.display ="none";
}

// Event listener for the button click
function showChart() {
  const chartContainer = document.getElementById('chartContainer');
  
  // Check if chart container exists
  // if (!chartContainer) {
  //   console.error('Chart container not found in the DOM');
  //   return;
  // }
    const databaseRef = firebase.database().ref(`TESTING/WTC/WTC_BX_44fdeb/DATA/DAY_${currentPage}`);
    databaseRef.once('value')
      .then(snapshot => {
        const distanceData = snapshot.val();
      if(distanceData==null)
      {
        alert("No data found for the page:"+currentPage);
        document.getElementById('dataCycle').innerHTML = `Data Cycle: ERROR!`;
        // document.getElementById('showChartButton').innerHTML="Show Chart";
        return;
      }
      console.log(currentPage);
      // startRealtimeChart('WTC_BX_44fdeb', currentPage);
        // createChart(distanceData); // Call the function to create the chart
      })
      .catch(error => { 
        console.error('Error fetching data from Firebase:', error);
      });
  }


function reloadData() {
  currentPage= document.getElementById('pageSelector').value;
  selectPage(currentPage,"NA");
  // distanceChart.destroy();
  chartInitialized = false;
  // initializeChart();

}

function scrollToBottom() {
  const tbody = document.getElementById("data").getElementsByTagName('tbody')[0];
  tbody.scrollTop = tbody.scrollHeight;
}

// Function to export all datasets to Excel


// Function to convert table data to sheet format
// function convertDataToSheet() {
//   const sheet = {};
//   const table = document.getElementById('data'); // Assuming the table ID is 'data'
//   const rows = table.querySelectorAll('tbody tr');

//   for(let i=1;i<31;i++)
//   {
//     //selectPage(i);
//   // Construct a two-dimensional array containing table data
//   const data = Array.from(rows).map(row => {
//     return Array.from(row.cells).map(cell => cell.textContent);
//   });
//   // Add the data to the sheet
//   XLSX.utils.sheet_add_aoa(sheet, data);
//   }
//   return sheet;
// }




function showLiveData()
{
// Get a database reference to our posts
const databaseRef = firebase.database().ref(`TESTING/WTC/WTC_BX_44fdeb/DATA/DAY_${currentPage}`);
// Listen for any new data added to the database
databaseRef.on('child_added', snapshot => {
    // Handle the new data here
    const newData = snapshot.val();
    console.log('New data added:', newData);
    document.getElementById("liveDate").innerHTML = rotateDateFormat(formatDate(newData.TIMESTAMP));
    document.getElementById("liveTime").innerHTML = formatTime(newData.TIMESTAMP);
    document.getElementById("liveDistance").innerHTML = newData.DISTANCE;
    liveDistance = newData.DISTANCE;
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


function convertDataToSheet(distanceData) {
  const sheet = {};

  // --- Meta info ---
  const metaData = [
    ['Company Name', 'AWACON WTC'],
    ['Date Generated', new Date().toLocaleString()]
  ];
  XLSX.utils.sheet_add_aoa(sheet, metaData, { origin: 'A1' });

  const metaStyle = {
    font: { bold: true, sz: 14, color: { rgb: '000000' } },
    fill: { fgColor: { rgb: 'EDEDED' } },
    alignment: { horizontal: 'left' }
  };
  ['A1', 'A2'].forEach(cell => {
    if (sheet[cell]) {
      sheet[cell].s = metaStyle;
    }
  });

  // --- Headers ---
  const headerRow = [
    'Date', 'Time', 'Distance (cm)', 'Live Distance (cm)', 'Difference (cm)',
    'Dry Run Status', 'High Point', 'Low Point', 'Motor Status'
  ];
  XLSX.utils.sheet_add_aoa(sheet, [headerRow], { origin: 'A4' });

  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '1F4E78' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'AAAAAA' } },
      bottom: { style: 'thin', color: { rgb: 'AAAAAA' } }
    }
  };

  for (let i = 0; i < headerRow.length; i++) {
    const colLetter = String.fromCharCode(65 + i); // 'A' = 65
    const cellRef = colLetter + '4';
    if (sheet[cellRef]) {
      sheet[cellRef].s = headerStyle;
    }
  }

  // --- Data Rows ---
  const data = [];
  let prevDistance = null;

  Object.entries(distanceData).forEach(([key, entry]) => {
    const dateStr = rotateDateFormat(formatDate(entry.TIMESTAMP));;
    const timeStr = formatTime(entry.TIMESTAMP);

    const distance = parseInt(entry.DISTANCE) || "ERR_PWR || 0";
    const liveDistance = parseInt(entry.LIVE_DISTANCE) || 0;
    console.log(entry);
    const dryRun = (entry.DRYRUN_STATUS === true) ? 'TRUE' :
    (entry.MOTOR_STATUS === false) ? 'FALSE' : '';
    const highPoint = entry.HIGH_POINT || '';
    const lowPoint = entry.LOW_POINT || '';
    const motorStatus = (entry.MOTOR_STATUS === true) ? 'ON' :
    (entry.MOTOR_STATUS === false) ? 'OFF' : '';

    let difference = 'N/A';
    if (prevDistance !== null && !isNaN(distance)) {
      difference = Math.abs(distance - prevDistance);
    }

    prevDistance = !isNaN(distance) ? distance : prevDistance;

    data.push([
      dateStr, timeStr, distance, liveDistance, difference,
      dryRun, highPoint, lowPoint, motorStatus
    ]);
  });

  XLSX.utils.sheet_add_aoa(sheet, data, { origin: 'A5' });

  // --- Alternate Row Styling ---
  const rowStyle1 = { fill: { fgColor: { rgb: 'F9F9F9' } }, alignment: { horizontal: 'left' } };
  const rowStyle2 = { fill: { fgColor: { rgb: 'FFFFFF' } }, alignment: { horizontal: 'left' } };

  for (let i = 0; i < data.length; i++) {
    const rowNumber = i + 5;
    for (let j = 0; j < headerRow.length; j++) {
      const col = String.fromCharCode(65 + j); // 'A', 'B', ...
      const cellRef = col + rowNumber;
      if (sheet[cellRef]) {
        sheet[cellRef].s = i % 2 === 0 ? rowStyle1 : rowStyle2;
      }
    }
  }

  // --- Column widths ---
  sheet['!cols'] = headerRow.map(() => ({ wch: 18 }));

  // --- Freeze header row ---
  sheet['!freeze'] = { xSplit: 0, ySplit: 4 };

  return sheet;
}
function exportToExcel() {
  // console.log("excelprint");
  const wb = XLSX.utils.book_new();
  totalSheets = 0; // Reset totalSheets variable

  // Iterate over each dataset
  // for (let i = 1; i <= totalDatasets; i++) {
    const databaseRef = firebase.database().ref(`TESTING/WTC/WTC_BX_44fdeb/DATA/DAY_${currentPage}`);
    databaseRef.once('value')
      .then(snapshot => {
        const distanceData = snapshot.val();
        // console.log("i"+i+distanceData);
        console.log(distanceData);
        if (distanceData) {
          const sheetName = `Data${currentPage}`;
          const sheetData = convertDataToSheet(distanceData);
          if (sheetData) {
            XLSX.utils.book_append_sheet(wb, sheetData, sheetName);
            totalSheets++; // Increment totalSheets for each added sheet
          }
        }
        const now = new Date();
        const date = now.toLocaleDateString().replace(/\//g, '-'); // e.g., 17-06-2025
        const time = now.toLocaleTimeString().replace(/:/g, '-').replace(/\s/g, ''); // e.g., 2348PM or 23-48
        const filename = `Awacon_Sensor_Data_${date}_${time}.xlsx`;
      
        XLSX.writeFile(wb, filename);
          console.log(`Total sheets exported: ${totalSheets}`);
      })
      .catch(error => { 
        console.error('Error fetching data from Firebase:', error);
      });
  }
// }


