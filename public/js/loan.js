import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;

// ✅ GET LOGGED-IN USER
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
});

// ✅ APPLY LOAN FUNCTION
window.applyLoan = async function () {
  if (!currentUser) {
    alert("User not logged in");
    return;
  }

  const amount = document.getElementById("amount").value;
  const tenure = document.getElementById("tenure").value;
  const rate = document.getElementById("rate").value;

  await addDoc(collection(db, "loans"), {
    userId: currentUser.uid,   // ✅ FIXED
    loanAmount: Number(amount),
    tenure: Number(tenure),
    interestRate: Number(rate),
    status: "pending",
    createdAt: new Date()
  });

  alert("Loan application submitted");
  window.location.href = "dashboard.html";
};
