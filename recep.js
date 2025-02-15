import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  doc
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Firestore Collections
const patientsCollection = collection(db, "patients");
const billsCollection = collection(db, "bills");

// DOM Elements (Receptionist Dashboard)
const patientRegistrationForm = document.getElementById("patient-registration-form");
const patientListBody = document.getElementById("patient-list-body");
const doctorSelect = document.getElementById("doctor-select");
const logoutButton = document.getElementById("logout-btn");
const allottedDoctorSection = document.getElementById("allotted-doctor-section");

const billGenerationSection = document.getElementById("bill-generation-section");
const billForm = document.getElementById("bill-form");
const cancelBillButton = document.getElementById("cancel-bill");

const billDetailsSection = document.getElementById("bill-details-section");
const closeBillDetailsButton = document.getElementById("close-bill-details");

const doctorSearchSelect = document.getElementById("doctor-search-select");
const doctorSearchBtn = document.getElementById("doctor-search-btn");
const doctorSearchResultSection = document.getElementById("doctor-search-result");
const searchedDoctorName = document.getElementById("searched-doctor-name");
const searchPatientListBody = document.getElementById("search-patient-list-body");

// Store all patients
let allPatients = [];

// Render patients in the main table (for the selected doctor)
function renderPatients(patients) {
  patientListBody.innerHTML = "";
  patients.forEach((patient) => {
    const row = document.createElement("tr");
    row.dataset.token = patient.token;
    row.innerHTML = `
      <td>${patient.token}</td>
      <td>${patient.name}</td>
      <td>${patient.age}</td>
      <td>${patient.status}</td>
      <td>
        <button class="menu-btn">☰</button>
        <div class="menu-options" style="display: none;">
          <button class="delete-btn" data-id="${patient.id}">Delete</button>
          <button class="bill-btn" data-token="${patient.token}">Generate Bill</button>
          <button class="view-bill-btn" data-token="${patient.token}">View Bill</button>
        </div>
      </td>
    `;
    patientListBody.appendChild(row);
  });
}

// Render patients in the search results table
function renderSearchPatients(patients) {
  searchPatientListBody.innerHTML = "";
  patients.forEach((patient) => {
    const row = document.createElement("tr");
    row.dataset.token = patient.token;
    row.innerHTML = `
      <td>${patient.token}</td>
      <td>${patient.name}</td>
      <td>${patient.age}</td>
      <td>${patient.status}</td>
      <td>
        <button class="menu-btn">☰</button>
        <div class="menu-options" style="display: none;">
          <button class="delete-btn" data-id="${patient.id}">Delete</button>
          <button class="bill-btn" data-token="${patient.token}">Generate Bill</button>
          <button class="view-bill-btn" data-token="${patient.token}">View Bill</button>
        </div>
      </td>
    `;
    searchPatientListBody.appendChild(row);
  });
}

// Firestore functions
async function addPatientToFirestore(token, name, age, contact, status, doctorId) {
  try {
    await addDoc(patientsCollection, { token, name, age, contact, status, doctorId });
    alert("Patient registered successfully!");
  } catch (error) {
    console.error("Error adding patient:", error);
  }
}

async function deletePatientFromFirestore(patientId) {
  try {
    await deleteDoc(doc(db, "patients", patientId));
    alert("Patient deleted successfully!");
  } catch (error) {
    console.error("Error deleting patient:", error);
  }
}

async function addBillToFirestore(billData) {
  try {
    await addDoc(billsCollection, billData);
    alert("Bill saved successfully!");
  } catch (error) {
    console.error("Error saving bill:", error);
  }
}

async function viewBillDetails(patientToken) {
  try {
    const q = query(billsCollection, where("patientToken", "==", patientToken));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      alert("No bill found for this patient.");
      return;
    }
    // Assume one bill per patient
    const billDoc = querySnapshot.docs[0].data();
    document.getElementById("view-bill-patient-token").value = billDoc.patientToken;
    document.getElementById("view-consultation-fee").value = billDoc.consultationFee;
    document.getElementById("view-lab-fee").value = billDoc.labFee;
    document.getElementById("view-medicine-charges").value = billDoc.medicineCharges;
    document.getElementById("view-other-charges").value = billDoc.otherCharges;
    document.getElementById("view-total-amount").value = billDoc.totalAmount;
    document.getElementById("view-bill-date").value = new Date(billDoc.billDate).toLocaleString();
    billDetailsSection.style.display = "block";
  } catch (error) {
    console.error("Error viewing bill:", error);
  }
}

// --- Event Delegation for Main Patient List ---
patientListBody.addEventListener("click", (event) => {
  if (event.target.classList.contains("menu-btn")) {
    const menu = event.target.nextElementSibling;
    menu.style.display = (menu.style.display === "none" || !menu.style.display) ? "block" : "none";
  }
  if (event.target.classList.contains("delete-btn")) {
    const patientId = event.target.dataset.id;
    deletePatientFromFirestore(patientId);
  }
  if (event.target.classList.contains("bill-btn")) {
    const patientToken = event.target.dataset.token;
    document.getElementById("bill-patient-token").value = patientToken;
    billGenerationSection.style.display = "block";
  }
  if (event.target.classList.contains("view-bill-btn")) {
    const patientToken = event.target.dataset.token;
    viewBillDetails(patientToken);
  }
});

// --- Event Delegation for Search Results ---
searchPatientListBody.addEventListener("click", (event) => {
  if (event.target.classList.contains("menu-btn")) {
    const menu = event.target.nextElementSibling;
    menu.style.display = (menu.style.display === "none" || !menu.style.display) ? "block" : "none";
  }
  if (event.target.classList.contains("delete-btn")) {
    const patientId = event.target.dataset.id;
    deletePatientFromFirestore(patientId);
  }
  if (event.target.classList.contains("bill-btn")) {
    const patientToken = event.target.dataset.token;
    document.getElementById("bill-patient-token").value = patientToken;
    billGenerationSection.style.display = "block";
  }
  if (event.target.classList.contains("view-bill-btn")) {
    const patientToken = event.target.dataset.token;
    viewBillDetails(patientToken);
  }
});

// Patient Registration Form Submission
patientRegistrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("patient-name").value.trim();
  const age = document.getElementById("patient-age").value;
  const contact = document.getElementById("patient-contact").value.trim();
  const token = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit token
  const status = "Pending";
  const doctorId = doctorSelect.value;
  if (!name || !age || !contact || !doctorId) {
    alert("Please fill in all fields.");
    return;
  }
  await addPatientToFirestore(token, name, age, contact, status, doctorId);
  // Show the section for the selected doctor
  allottedDoctorSection.style.display = "block";
  document.getElementById("doctor-name").textContent = doctorId;
  patientRegistrationForm.reset();
});

// Real-Time Updates from Firestore (for receptionist view)
// Filter patients by the selected doctor in the registration dropdown.
onSnapshot(patientsCollection, (snapshot) => {
  allPatients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const selectedDoctor = doctorSelect.value;
  const filteredPatients = allPatients.filter(patient => patient.doctorId === selectedDoctor);
  renderPatients(filteredPatients);
});

// Logout functionality
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
});

// Bill Form Submission
billForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const billData = {
    patientToken: document.getElementById("bill-patient-token").value,
    consultationFee: Number(document.getElementById("consultation-fee").value),
    labFee: Number(document.getElementById("lab-fee").value),
    medicineCharges: Number(document.getElementById("medicine-charges").value),
    otherCharges: Number(document.getElementById("other-charges").value),
    totalAmount: Number(document.getElementById("total-amount").value),
    billDate: new Date().toISOString()
  };
  await addBillToFirestore(billData);
  billForm.reset();
  billGenerationSection.style.display = "none";
});

// Cancel Bill Generation
cancelBillButton.addEventListener("click", () => {
  billForm.reset();
  billGenerationSection.style.display = "none";
});

// Close Bill Details Section
closeBillDetailsButton.addEventListener("click", () => {
  billDetailsSection.style.display = "none";
});

// Doctor Search Functionality
doctorSearchBtn.addEventListener("click", () => {
  const selectedDoctor = doctorSearchSelect.value;
  if (!selectedDoctor) {
    alert("Please select a doctor to search.");
    return;
  }
  const filteredPatients = allPatients.filter(patient => patient.doctorId === selectedDoctor);
  if (filteredPatients.length === 0) {
    alert("No patients found for the selected doctor.");
    doctorSearchResultSection.style.display = "none";
    return;
  }
  searchedDoctorName.textContent = selectedDoctor;
  renderSearchPatients(filteredPatients);
  doctorSearchResultSection.style.display = "block";
});
