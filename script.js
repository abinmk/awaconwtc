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
  

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to the Firebase Realtime Database
const databaseURL = "https://awaconwtc-default-rtdb.firebaseio.com/";
const databaseRef = firebase.database().ref('UsersData/4P7aUzvuI8RM0Pb2dPACF3V9SCz2/readings/data');

// Function to update data on the webpage
function updateDataOnPage(data) {
  document.getElementById('distance').innerText = data.Distance || 'N/A';
  document.getElementById('pressure').innerText = data.Pressure || 'N/A';
  document.getElementById('timestamp').innerText = data.Timestamp || 'N/A';
}

// Fetch data from Firebase and update the webpage
function fetchData() {
  fetch(`${databaseRef}.json`)
    .then(response => response.json())
    .then(data => {
      updateDataOnPage(data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

// Fetch data initially
fetchData();

// Set interval to fetch data periodically (every 5 seconds)
setInterval(fetchData, 1000);

