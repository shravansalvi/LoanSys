import { auth, db } from "../../public/js/firebase-config.js";


import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// AUTH CHECK
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../public/login.html";
    return;
  }

  // GET USER ROLE
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    alert("Access Denied");
    window.location.href = "../dashboard.html";
    return;
  }

  document.getElementById("adminName").innerText =
    "Welcome, " + userSnap.data().name;

  loadLoanStats();
});

// LOAD LOAN COUNTS
async function loadLoanStats() {
  const snapshot = await getDocs(collection(db, "loans"));

  let total = 0;
  let pending = 0;
  let approved = 0;

  snapshot.forEach((docSnap) => {
    total++;
    const status = docSnap.data().status;

    if (status === "pending") pending++;
    if (status === "approved") approved++;
  });

  document.getElementById("totalLoans").innerText = total;
  document.getElementById("pendingLoans").innerText = pending;
  document.getElementById("approvedLoans").innerText = approved;
}

// LOGOUT
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "../public/login.html";
  });
};
