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
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // 1️⃣ Get approved loan
  const loanSnap = await getDocs(
    query(
      collection(db, "loans"),
      where("userId", "==", user.uid),
      where("status", "==", "approved")
    )
  );

  // ❗ SAFETY CHECK
  if (loanSnap.empty) {
    document.getElementById("emiTable").innerHTML =
      "<tr><td colspan='4'>No approved loan found</td></tr>";
    return;
  }


  const loanId = loanSnap.docs[0].id;

  // 2️⃣ Get EMI schedule
  const emiSnap = await getDocs(
    query(collection(db, "repayments"), where("loanId", "==", loanId))
  );

  const table = document.getElementById("emiTable");
  table.innerHTML = "";

  if (emiSnap.empty) {
    table.innerHTML =
      "<tr><td colspan='4'>No EMI schedule found</td></tr>";
    return;
  }
  const emis = [];
  emiSnap.forEach(d => emis.push({ id: d.id, ...d.data() }));

  emis.sort((a, b) => a.emiNumber - b.emiNumber);

  // 3️⃣ Render EMI list
  emis.forEach((emi, index) => {
    const canPay =
      emi.status === "pending" &&
      (index === 0 || emis[index - 1].status === "paid");

    table.innerHTML += `
    <tr>
      <td>EMI ${emi.emiNumber}</td>
      <td>₹${emi.amount}</td>
      <td>${emi.status}</td>
      <td>
  ${emi.dueDate
        ? emi.dueDate.toDate().toLocaleDateString()
        : "Not Set"}
</td>

    
      <td>
        ${canPay
        ? `<button onclick="payEmi('${emi.id}')">Pay</button>`
        : emi.status === "paid"
          ? "Paid"
          : "Locked"
      }
      </td>
    </tr>
  `;
  });

});

window.payEmi = async function (id) {
  const emiRef = doc(db, "repayments", id);
  const emiSnap = await getDoc(emiRef);
  const emi = emiSnap.data();

  // 1️⃣ Mark this EMI as paid
  await updateDoc(emiRef, {
    status: "paid",
    paidOn: new Date()
  });

  // 2️⃣ Check if all EMIs are paid
  const allEmisSnap = await getDocs(
    query(
      collection(db, "repayments"),
      where("loanId", "==", emi.loanId)
    )
  );

  let allPaid = true;

  allEmisSnap.forEach((d) => {
    if (d.data().status !== "paid") {
      allPaid = false;
    }
  });

  // 3️⃣ If all paid → close loan
  if (allPaid) {
    await updateDoc(doc(db, "loans", emi.loanId), {
      status: "closed",
      closedOn: new Date()
    });

    alert("🎉 All EMIs paid. Loan closed successfully!");
  } else {
    alert("EMI Paid Successfully");
  }

  location.reload();
};

if (loan.status === "closed") {
  document.getElementById("emiTable").innerHTML =
    "<tr><td colspan='4'>Loan is closed. No pending EMIs.</td></tr>";
  return;
}


