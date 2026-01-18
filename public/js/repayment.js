// ===============================
// Firebase Imports (ONLY ONCE)
// ===============================
import { auth, db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===============================
// AUTH GUARD
// ===============================
onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname.includes("pay-emi")) {
    window.location.href = "login.html";
  }
});

// ===============================
// LOAD EMI TABLE
// ===============================
async function loadEMIs() {
  const emiTable = document.getElementById("emiTable");
  
  if (!emiTable) {
    console.error("emiTable element not found");
    return;
  }

  try {
    const uid = localStorage.getItem("uid");
    if (!uid) {
      window.location.href = "login.html";
      return;
    }

    // Get approved loans
    const loansQuery = query(
      collection(db, "loans"),
      where("uid", "==", uid),
      where("status", "==", "approved")
    );

    const loansSnapshot = await getDocs(loansQuery);
    emiTable.innerHTML = "";

    if (loansSnapshot.empty) {
      emiTable.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #999; padding: 20px;">
            📭 No approved loans with pending EMIs
          </td>
        </tr>
      `;
      return;
    }

    let html = "";
    loansSnapshot.forEach((loanDoc) => {
      const loanData = loanDoc.data();
      const monthlyEMI = parseFloat(loanData.monthlyEMI || 0);
      const maxMonths = Math.min(loanData.tenure || 12, 12);
      
      for (let i = 1; i <= maxMonths; i++) {
        const row = `
          <tr>
            <td>${loanData.loanName || "EMI"} - Month ${i}</td>
            <td>₹${monthlyEMI.toLocaleString()}</td>
            <td><span class="badge badge-pending">⏳ Pending</span></td>
            <td>
              <button class="btn btn-success" onclick="payEMI('${loanDoc.id}', ${i}, ${monthlyEMI})">
                💳 Pay Now
              </button>
            </td>
          </tr>
        `;
        html += row;
      }
    });
    
    emiTable.innerHTML = html;
  } catch (error) {
    console.error("Error loading EMIs:", error);
    emiTable.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: red; padding: 20px;">
          ❌ Error loading EMIs
        </td>
      </tr>
    `;
  }
}

// ===============================
// PAY EMI FUNCTION
// ===============================
async function payEMI(loanId, emiNo, amount) {
  try {
    const uid = localStorage.getItem("uid");
    const userName = localStorage.getItem("userName") || "User";

    const confirmed = confirm(`💳 Confirm payment of ₹${parseFloat(amount).toLocaleString()} for EMI #${emiNo}?`);
    
    if (!confirmed) return;

    // Record payment
    await addDoc(collection(db, "emiPayments"), {
      uid: uid,
      userName: userName,
      loanId: loanId,
      emiNo: emiNo,
      amount: amount,
      status: "paid",
      paidOn: new Date(),
      paymentMethod: "Online"
    });

    alert("✅ Payment of ₹" + parseFloat(amount).toLocaleString() + " processed successfully!");
    loadEMIs();
  } catch (error) {
    console.error("Payment error:", error);
    alert("❌ Payment failed: " + error.message);
  }
}

window.payEMI = payEMI;
document.addEventListener("DOMContentLoaded", loadEMIs);
