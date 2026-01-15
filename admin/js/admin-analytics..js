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
  if (!user) return;

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (userSnap.data().role !== "admin") {
    alert("Access denied");
    return;
  }

  // 📊 LOANS
  const loansSnap = await getDocs(collection(db, "loans"));
  let approved = 0, closed = 0;

  loansSnap.forEach((d) => {
    const s = d.data().status;
    if (s === "approved") approved++;
    if (s === "closed") closed++;
  });

  document.getElementById("totalLoans").innerText = loansSnap.size;
document.getElementById("approvedLoans").innerText = approved;
document.getElementById("closedLoans").innerText = closed;




  // 📊 EMIs
  const emiSnap = await getDocs(collection(db, "repayments"));
  let paid = 0, pending = 0;

  emiSnap.forEach((d) => {
    d.data().status === "paid" ? paid++ : pending++;
  });

 document.getElementById("totalEmis").innerText = emiSnap.size;
document.getElementById("paidEmis").innerText = paid;
document.getElementById("pendingEmis").innerText = pending;

document.getElementById("pendingEmis").innerText = pending;
const loanCtx = document.getElementById("loanPieChart");

new Chart(loanCtx, {
  type: "pie",
  data: {
    labels: ["Approved Loans", "Closed Loans"],
    datasets: [{
      data: [approved, closed],
      backgroundColor: ["#f59e0b", "#22c55e"]
    }]
  },
  options: {
    responsive: true
  }
});
const emiCtx = document.getElementById("emiBarChart");

new Chart(emiCtx, {
  type: "bar",
  data: {
    labels: ["Paid EMIs", "Pending EMIs"],
    datasets: [{
      label: "EMI Count",
      data: [paid, pending],
      backgroundColor: ["#16a34a", "#dc2626"]
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

});


