import { auth, db } from "./firebase-config.js";
import { collection, addDoc, query, where, getDocs } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Check authentication
onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname.includes("apply-loan")) {
    window.location.href = "login.html";
  }
});

async function applyLoan(event) {
  event.preventDefault();
  
  try {
    const uid = localStorage.getItem("uid");
    if (!uid) {
      alert("❌ Please login first");
      window.location.href = "login.html";
      return;
    }

    const loanNameInput = document.getElementById("loanName");
    const amountInput = document.getElementById("amount");
    const tenureInput = document.getElementById("tenure");
    const rateInput = document.getElementById("rate");

    if (!loanNameInput || !amountInput || !tenureInput || !rateInput) {
      console.error("Form elements not found");
      return;
    }

    const loanName = loanNameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const tenure = parseInt(tenureInput.value);
    const rate = parseFloat(rateInput.value);

    // Validation
    if (!loanName || !amount || !tenure || !rate) {
      alert("❌ Please fill all fields");
      return;
    }

    if (amount < 1000) {
      alert("❌ Loan amount must be at least ₹1,000");
      return;
    }

    if (amount > 10000000) {
      alert("❌ Loan amount cannot exceed ₹1 Crore");
      return;
    }

    if (tenure < 1 || tenure > 360) {
      alert("❌ Tenure must be between 1 and 360 months");
      return;
    }

    if (rate < 0 || rate > 25) {
      alert("❌ Interest rate must be between 0% and 25%");
      return;
    }

    // Calculate monthly EMI using proper formula
    const monthlyRate = rate / 100 / 12;
    let monthlyEMI;
    
    if (monthlyRate === 0) {
      monthlyEMI = amount / tenure;
    } else {
      monthlyEMI = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    }

    const totalAmount = monthlyEMI * tenure;

    // Get user name from Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid));
    const userSnapshot = await getDocs(q);
    const userName = userSnapshot.docs[0]?.data().name || "User";

    const loanData = {
      uid: uid,
      userName: userName,
      loanName: loanName,
      amount: amount,
      tenure: tenure,
      rate: rate,
      status: "pending",
      monthlyEMI: parseFloat(monthlyEMI.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      createdAt: new Date()
    };

    await addDoc(collection(db, "loans"), loanData);
    alert("✅ Loan application submitted successfully!");
    loanNameInput.value = "";
    amountInput.value = "";
    tenureInput.value = "";
    rateInput.value = "";
    setTimeout(() => window.location.href = "borrower-loans.html", 1500);
  } catch (error) {
    console.error("Loan application error:", error);
    alert("❌ Error submitting loan: " + error.message);
  }
}

window.applyLoan = applyLoan;
