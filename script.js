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

let slno = 0;
let page = 1; // Default page
let databaseRef;

function exportToExcel() {
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.table_to_sheet(document.querySelector('.dataTable'));

  ws["A1"].s = { fill: { patternType: "solid", fgColor: { rgb: "FF0000" } } };

  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, "Awacon_Sensor_Data.xlsx");
}

function updateDataOnPage(snapshot, serial) {
  const data = snapshot.val();
  if (data) {
      const unixTimestamp = data.Timestamp;
      const timestampInMilliseconds = unixTimestamp * 1000;

      const date = new Date(timestampInMilliseconds);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();

      const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

      const tableId = `data${page}`;
      var table = document.getElementById(tableId);
      var row = table.insertRow();
      let PrevDistance;
      for (var j = 1; j <= 6; j++) {
          var cell = row.insertCell();
          switch (j) {
              case 1:
                  cell.innerHTML = serial;
                  break;
              case 2:
                  cell.innerHTML = day + "/" + month + "/" + year;
                  break;
              case 3:
                  cell.innerHTML = hour + ":" + minute + ":" + second;
                  break;
              case 4:
                  cell.innerHTML = data.Distance + " cm";
                  break;
              case 5:
                  cell.innerHTML = data.Distance - PrevDistance;
                  break;
              case 6:
                  cell.innerHTML = data.Pressure;
                  break;
          }
          PrevDistance = data.Distance;
      }
  } else {
      console.log('Data not found');
  }
}

function selectPage(value) {
  page = value;
  document.getElementById('dataCycle').innerHTML = "Data Cycle : " + page;
  
  // Hide all tables first
  document.querySelectorAll('.dataTable').forEach(table => {
    table.style.display = 'none';
  });

  // Show the selected table
  document.getElementById(`data${page}`).style.display = '';

  // Clear the content of the selected table
  document.getElementById(`data${page}`).innerHTML = '';

  // Reset slno to start fetching data from the beginning
  slno = 0;
  intervalId = setInterval(fetchData, 1); // Store the interval ID
  fetchData(); // Fetch data for the selected page
}


function showLoadingOverlay() {
  document.getElementById('loadingOverlay').style.display = 'block';
}

function hideLoadingOverlay() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

function fetchData() {
  if (slno >= 500) {
    console.log("Reached maximum slno. Stopping loading.");
    slno=0;hideLoadingOverlay()
    clearInterval(intervalId); // Stop the interval timer
    return; // Stop further execution if slno is 500 or greater
  }
  slno++;
  let currentSlno = slno; // Store the current value of slno
  showLoadingOverlay();

  switch (page) {
      case 2:
          databaseRef = firebase.database().ref(`UsersData/4P7aUzvuI8RM0Pb2dPACF3V9SCz2/readings/data2/${currentSlno}`);
          break;
      case 3:
          databaseRef = firebase.database().ref(`UsersData/4P7aUzvuI8RM0Pb2dPACF3V9SCz2/readings/data3/${currentSlno}`);
          break;
      default:
          databaseRef = firebase.database().ref(`UsersData/4P7aUzvuI8RM0Pb2dPACF3V9SCz2/readings/data1/${currentSlno}`);
          break;
  }

  databaseRef.once('value')
      .then(snapshot => {
          updateDataOnPage(snapshot, currentSlno); // Pass currentSlno to updateDataOnPage
          
      })
      .catch(error => {
          console.error('Error fetching data:', error);
          hideLoadingOverlay()
      });
}

// Call fetchData immediately and then at intervals
fetchData();
let intervalId; // Variable to store the interval ID

// Call fetchData immediately and then at intervals
fetchData();
intervalId = setInterval(fetchData, 1); // Store the interval ID