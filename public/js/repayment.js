import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  const loanSnap = await getDocs(
    query(
      collection(db, "loans"),
      where("userId", "==", user.uid),
      where("status", "==", "approved")
    )
  );

  const loanId = loanSnap.docs[0].id;

  const emiSnap = await getDocs(
    query(collection(db, "repayments"), where("loanId", "==", loanId))
  );

  const table = document.getElementById("emiTable");
  table.innerHTML = "";

  emiSnap.forEach((d) => {
    const emi = d.data();

    table.innerHTML += `
      <tr>
        <td>${emi.emiNumber}</td>
        <td>₹${emi.amount}</td>
        <td>${emi.status}</td>
        <td>
          ${
            emi.status === "pending"
              ? `<button onclick="payEmi('${d.id}')">Pay</button>`
              : "Paid"
          }
        </td>
      </tr>
    `;
  });
});

window.payEmi = async function (id) {
  await updateDoc(doc(db, "repayments", id), {
    status: "paid",
    paidOn: new Date()
  });

  alert("EMI Paid");
  location.reload();
};
