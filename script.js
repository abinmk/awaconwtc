// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBn2mbRAikL5ZfiQcf9sn-qfsng4NoOBeU",
    authDomain: "awaconwtc.firebaseapp.com",
    databaseURL: "https://awaconwtc-default-rtdb.firebaseio.com",
    projectId: "awaconwtc",
    storageBucket: "awaconwtc.appspot.com",
    messagingSenderId: "1095771274237",
    appId: "1:1095771274237:web:66fc399a5415caa5bf3794"
  };
  
  function exportToExcel() {
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.table_to_sheet(document.getElementById("dataTable"));
    
    // Example: Apply background color to header row
    ws["A1"].s = { fill: { patternType: "solid", fgColor: { rgb: "FF0000" } } };

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "table_data.xlsx");
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to the Firebase Realtime Database
const databaseURL = "https://awaconwtc-default-rtdb.firebaseio.com/";
const databaseRef = firebase.database().ref('UsersData/4P7aUzvuI8RM0Pb2dPACF3V9SCz2/readings/data');



// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

// Reference to the Firebase Realtime Database
const database = firebaseApp.database();

// Function to update data on the webpage
function updateDataOnPage(snapshot) {
  const data = snapshot.val();
  if (data) {
const unixTimestamp = data.Timestamp; // Example timestamp

// // Create a new Date object with the Unix timestamp
// // Unix timestamp in seconds
// const unixTimestamp = 1708776668;

// Convert Unix timestamp to milliseconds by multiplying by 1000
const timestampInMilliseconds = unixTimestamp * 1000;

// Create a new Date object with the Unix timestamp in milliseconds
const date = new Date(timestampInMilliseconds);

// Get the individual components of the date (year, month, day, hour, minute, second)
const year = date.getFullYear();
const month = date.getMonth() + 1; // Month is zero-based, so add 1
const day = date.getDate();
const hour = date.getHours();
const minute = date.getMinutes();
const second = date.getSeconds();

// Format the date as desired (e.g., YYYY-MM-DD HH:MM:SS)
const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

console.log(formattedDate);


  var table = document.getElementById("dataTable");
  var row = table.insertRow();
  let PrevDistance;
  for (var j = 1; j <= 5; j++) {
    var cell = row.insertCell();
    
    switch(j)
    {
      case 1:cell.innerHTML = day+"/"+month+"/"+year;break;
      case 2:cell.innerHTML = hour+":"+minute+":"+second;break;
      case 3:cell.innerHTML = data.Distance+" cm";break;
      case 4:cell.innerHTML = data.Distance-PrevDistance;break;
      case 5:cell.innerHTML = data.Pressure;break;
    }
    PrevDistance = data.Distance;
}
  } else {
    console.log('Data not found');
  }




}

// Fetch data from Firebase and update the webpage
function fetchData() {
  databaseRef.once('value')
    .then(snapshot => {
      updateDataOnPage(snapshot);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

// Fetch data initially
fetchData();

// Set interval to fetch data periodically (every 5 seconds)
setInterval(fetchData, 100);