import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));

  const role = snap.data().role;
  const name = snap.data().name;

  document.getElementById("welcome").innerText =
    "Welcome, " + name;

  // HIDE BOTH FIRST
  document.getElementById("borrowerSection").style.display = "none";
  document.getElementById("adminSection").style.display = "none";

  // SHOW BASED ON ROLE
  if (role === "borrower") {
    document.getElementById("borrowerSection").style.display = "block";
  }

  if (role === "admin" || role === "loan_officer") {
    document.getElementById("adminSection").style.display = "block";
  }
});

// LOGOUT
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};
