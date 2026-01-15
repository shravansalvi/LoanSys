import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentLoanId = null;
let emiAmount = null;

// CHECK LOGIN & LOAD EMI
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const loanQuery = query(
    collection(db, "loans"),
    where("userId", "==", user.uid),
    where("status", "==", "approved")
  );

  const snapshot = await getDocs(loanQuery);

  if (snapshot.empty) {
    document.getElementById("emiAmount").innerText =
      "No approved loan found";
    return;
  }

  const loanData = snapshot.docs[0].data();

  // 🔐 SAFETY CHECK
  if (!loanData.emi) {
    alert("EMI not generated yet. Ask admin to approve loan.");
    return;
  }

  currentLoanId = snapshot.docs[0].id;
  emiAmount = Number(loanData.emi);

  document.getElementById("emiAmount").innerText = emiAmount;
});

// PAY EMI (GLOBAL FUNCTION)
window.payEmi = async function () {
  if (!currentLoanId || emiAmount === null) {
    alert("EMI data not available");
    return;
  }

  await addDoc(collection(db, "repayments"), {
    loanId: currentLoanId,
    amount: emiAmount,
    paidOn: new Date()
  });

  alert("EMI Paid Successfully");
};
