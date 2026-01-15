import { auth, db } from "../../public/js/firebase-config.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../../public/login.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (userSnap.data().role !== "admin") {
    alert("Access denied");
    return;
  }

  const snap = await getDocs(collection(db, "repayments"));
  const table = document.getElementById("repaymentTable");
  table.innerHTML = "";

  snap.forEach((d) => {
    const r = d.data();

    table.innerHTML += `
      <tr>
        <td>${r.loanId}</td>
        <td>${r.emiNumber}</td>
        <td>₹${r.amount}</td>
        <td>${r.status}</td>
        <td>${r.paidOn ? r.paidOn.toDate().toLocaleDateString() : "-"}</td>
      </tr>
    `;
  });
});
