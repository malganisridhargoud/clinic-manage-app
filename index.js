
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeKTBvEvEkFnbu1FvcTMp_067hXrFiWtA",
  authDomain: "clinic-manage-app.firebaseapp.com",
  databaseURL: "https://clinic-manage-app-default-rtdb.firebaseio.com",
  projectId: "clinic-manage-app",
  storageBucket: "clinic-manage-app.firebasestorage.app",
  messagingSenderId: "4062099599",
  appId: "1:4062099599:web:ced32b0afa10e9efaa18fa",
  measurementId: "G-Y3YBXEYJ5L"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Updates the placeholder text */
function updatePlaceholders() {
  const userType = document.getElementById("user-type").value;
  const identifierInput = document.getElementById("identifier");

  if (userType === "doctor") {
           identifierInput.placeholder = "Enter Doctor ID (e.g., DOC01)";
  } else if (userType === "receptionist") {
    identifierInput.placeholder = "Enter Email";
  } else { identifierInput.placeholder = "Select User Type First";
  }
}

/**
 * Handles the login form submission. */
async function handleLogin(event) {
  event.preventDefault();
     
          const userType = document.getElementById("user-type").value;
 const identifier = document.getElementById("identifier").value.trim();
const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("error-message");

  // Clear 
  errorMessage.textContent = "";

  if (userType === "doctor") {

    // doctor ID: must be DOC01 to DOC10
const doctorRegex = /^(DOC0[1-9]|DOC10)$/;
    if (!doctorRegex.test(identifier)) {
errorMessage.textContent = "Invalid Doctor ID. Please enter a valid Doctor ID (DOC01 to DOC10).";
      return;
    }
    // Save the doctor ID 
    localStorage.setItem("doctorId", identifier);
    window.location.href = "doctor.html";

  } else if (userType === "receptionist") {
    
    if (identifier !== "healthcare@hospital.com" || password !== "health") {
  errorMessage.textContent = "Invalid receptionist credentials.";
      return;
    }

    try {
      // Use Firebase 
      await signInWithEmailAndPassword(auth, identifier, password);

      // Check if the login is successful
      if (auth.currentUser) {
 console.log("Receptionist login successful!");
  window.location.href = "receptionist.html";
      } else {
        errorMessage.textContent = "Login failed: Please check your credentials.";
      }
    } catch (error) {
      // display Firebase  error msg
 console.error("Login failed:", error.message);
      errorMessage.textContent = "Login failed: " + error.message;
    }
  } else {
    errorMessage.textContent = "Please select a user type.";
  }
}

//  functions to global scope
window.updatePlaceholders = updatePlaceholders;
window.handleLogin = handleLogin;
