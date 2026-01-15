import { auth, db } from "../../public/js/firebase-config.js";

import { onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// AUTH + ROLE CHECK
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../../public/login.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    alert("Access denied");
    return;
  }

  loadPendingLoans();
});


// LOAD PENDING LOANS
async function loadPendingLoans() {
  const loanList = document.getElementById("loanList");
  loanList.innerHTML = "Loading...";

  const q = query(
    collection(db, "loans"),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    loanList.innerHTML = "No loan application found";
    return;
  }

  loanList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const loan = docSnap.data();

    loanList.innerHTML += `
  <div style="border:1px solid #ccc; padding:10px; margin:10px;">
    <p><b>Amount:</b> ₹${loan.loanAmount}</p>
    <p><b>Tenure:</b> ${loan.tenure} months</p>

    <button onclick="approveLoan('${docSnap.id}')">Approve</button>
    <button onclick="rejectLoan('${docSnap.id}')">Reject</button>
  </div>
`;
  });
}

// APPROVE LOAN (loanId is DEFINED HERE ✅)
window.approveLoan = async function (loanId) {
  const loanRef = doc(db, "loans", loanId);
  const loanSnap = await getDoc(loanRef);
  const loan = loanSnap.data();

  const P = loan.loanAmount;
  const R = loan.interestRate / (12 * 100);
  const N = loan.tenure;

  const emi =
    (P * R * Math.pow(1 + R, N)) /
    (Math.pow(1 + R, N) - 1);

  // 1️⃣ Update loan
  await updateDoc(loanRef, {
    status: "approved",
    emi: Math.round(emi)
  });

  // 2️⃣ Create EMI schedule
  for (let i = 1; i <= N; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);

    await addDoc(collection(db, "repayments"), {
      loanId,
      emiNumber: i,
      amount: Math.round(emi),
      status: "pending",
      dueDate: dueDate
    });


  }

  alert("Loan Approved");
  loadPendingLoans();
};


// REJECT LOAN
window.rejectLoan = async function (loanId) {
  await updateDoc(doc(db, "loans", loanId), {
    status: "rejected"
  });

  loadPendingLoans();
};
