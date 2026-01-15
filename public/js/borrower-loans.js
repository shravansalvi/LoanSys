import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CHECK LOGIN
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadMyLoans(user.uid);
});

// LOAD BORROWER LOANS
async function loadMyLoans(userId) {
  const loanList = document.getElementById("loanList");
  loanList.innerHTML = "";

  const q = query(
    collection(db, "loans"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    loanList.innerHTML = "<p>No loans applied yet</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const loan = docSnap.data();

    loanList.innerHTML += `
      <div style="border:1px solid #ccc; padding:10px; margin:10px;">
        <p><b>Loan Amount:</b> ₹${loan.loanAmount}</p>
        <p><b>Interest:</b> ${loan.interestRate}%</p>
        <p><b>Tenure:</b> ${loan.tenure} months</p>
        <p><b>Status:</b> <b>${loan.status}</b></p>
      </div>
    `;
  });
}
