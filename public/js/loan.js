
import { auth, db } from "./firebase-config.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// CHECK LOGIN
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// APPLY LOAN
window.applyLoan = async function () {
  const amount = document.getElementById("amount").value;
  const interest = document.getElementById("interest").value;
  const tenure = document.getElementById("tenure").value;

  if (!amount || !interest || !tenure) {
    alert("Please fill all fields");
    return;
  }

  try {
    await addDoc(collection(db, "loans"), {
      userId: auth.currentUser.uid,
      loanAmount: Number(amount),
      interestRate: Number(interest),
      tenure: Number(tenure),
      status: "pending",
      appliedOn: new Date()
    });

    alert("Loan Application Submitted");
    window.location.href = "dashboard.html";

  } catch (error) {
    alert(error.message);
  }
};
