import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // 1️⃣ Get approved loan of borrower
  const loanSnap = await getDocs(
    query(
      collection(db, "loans"),
      where("userId", "==", user.uid),
      where("status", "==", "approved")
    )
  );

  if (loanSnap.empty) {
    document.getElementById("historyTable").innerHTML =
      "<tr><td colspan='4'>No approved loan</td></tr>";
    return;
  }

  const loanId = loanSnap.docs[0].id;

  // 2️⃣ Get repayment history
  const repaySnap = await getDocs(
    query(
      collection(db, "repayments"),
      where("loanId", "==", loanId)
    )
  );

  const table = document.getElementById("historyTable");
  table.innerHTML = "";

  repaySnap.forEach((docSnap) => {
    const r = docSnap.data();

    table.innerHTML += `
      <tr>
        <td>${r.emiNumber}</td>
        <td>₹${r.amount}</td>
        <td>${r.status}</td>
        <td>${r.paidOn ? r.paidOn.toDate().toLocaleDateString() : "-"}</td>
      </tr>
    `;
  });
});
