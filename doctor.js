
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBO_yFXk_8zi-9VqvOwcau9QUDsTxznx5U",
  authDomain: "clinic-manage-app.firebaseapp.com",
  databaseURL: "https://clinic-manage-app-default-rtdb.firebaseio.com",
  projectId: "clinic-manage-app",
  storageBucket: "clinic-manage-app.firebasestorage.app",
  messagingSenderId: "4062099599",
  appId: "1:4062099599:web:ced32b0afa10e9efaa18fa",
  measurementId: "G-Y3YBXEYJ5L"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

//  current doctor ID from localStorage
const currentDoctorId = localStorage.getItem("doctorId");
if (!currentDoctorId) {
  
  window.location.href = "index.html";
}

// Update the UI 
document.getElementById("doctor-name").textContent = currentDoctorId;

const patientListBody = document.getElementById("patient-list-body");
const logoutButton = document.getElementById("logout-btn");

// Function to render the patient rows
function renderPatients(patients) {
  patientListBody.innerHTML = "";
  patients.forEach((patient) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${patient.token}</td>
      <td>${patient.name}</td>
<td>${patient.age}</td>
<td id="status-${patient.id}">${patient.status}</td>
      <td id="actions-${patient.id}"></td>
    `;
    const actionsTd = tr.querySelector(`#actions-${patient.id}`);
    if (patient.status === "Pending") {
      actionsTd.innerHTML = `
        <button class="approve-btn" data-id="${patient.id}">Approve</button>
  <button class="wait-btn" data-id="${patient.id}">Decline</button>
      `;
    } else if (patient.status === "Waiting") {
      actionsTd.innerHTML = `<span> Appointment Declined </span>`;
    } else {
      actionsTd.innerHTML = `<span>--</span>`;
    }
    patientListBody.appendChild(tr);
  });
}

// real-time listener for patients 
const patientsRef = collection(db, "patients");
const q = query(patientsRef, where("doctorId", "==", currentDoctorId));
onSnapshot(q, (snapshot) => {
  const patients = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  renderPatients(patients);
});

//  Approve and Wait actions on patient rows
patientListBody.addEventListener("click", async (event) => {
  if (event.target.classList.contains("approve-btn")) {
    const patientId = event.target.dataset.id;
    try {
      const patientDocRef = doc(db, "patients", patientId);
      await updateDoc(patientDocRef, { status: "Approved" });
    } catch (error) {
      console.error("Error approving patient:", error);
    }
  }

  if (event.target.classList.contains("wait-btn")) {
    const patientId = event.target.dataset.id;
    try {
      const patientDocRef = doc(db, "patients", patientId);
      
      await updateDoc(patientDocRef, { status: "Decline" });

      // After 5 minutes (300,000 ms)
      setTimeout(async () => {
        try {
          await updateDoc(patientDocRef, { status: "Declined" });
        } catch (error) {     console.error("Error updating patient :");
        }
      }, 300000);
    } catch (error) {
      console.error("Error setting patient to Decline:");
    }
  }
});

// Logout the current user and redirect to the login page.
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {    console.error("Logout error:", error);
    });
});
