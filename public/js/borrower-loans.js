// ===============================
// Firebase Imports
// ===============================
import { auth, db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===============================
// LOAD BORROWER LOANS
// ===============================
async function loadBorrowerLoans() {
  const loanList = document.getElementById("loanList");
  
  if (!loanList) {
    console.error("loanList element not found");
    return;
  }

  try {
    const uid = localStorage.getItem("uid");
    if (!uid) {
      window.location.href = "login.html";
      return;
    }

    const loansQuery = query(
      collection(db, "loans"),
      where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(loansQuery);
    loanList.innerHTML = "";

    if (querySnapshot.empty) {
      loanList.innerHTML = `
        <p style="text-align: center; color: #999; padding: 20px;">
          📭 No loan applications found
        </p>
      `;
      return;
    }

    let html = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdDate = data.createdAt?.toDate?.() 
        ? new Date(data.createdAt.toDate()).toLocaleDateString("en-IN") 
        : "N/A";
      
      const statusClass = `badge-${data.status || "pending"}`;
      const statusIcon = {
        pending: "⏳",
        approved: "✅",
        rejected: "❌",
        closed: "🏁"
      }[data.status] || "📋";

      const card = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${statusIcon} ${data.loanName || "Loan"}</h3>
            <span class="badge ${statusClass}">${(data.status || "pending").toUpperCase()}</span>
          </div>
          <div class="card-content">
            <div class="card-row">
              <span class="card-label">Loan Amount:</span>
              <span class="card-value">₹${parseFloat(data.amount || 0).toLocaleString()}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Tenure:</span>
              <span class="card-value">${data.tenure || 0} months</span>
            </div>
            <div class="card-row">
              <span class="card-label">Interest Rate:</span>
              <span class="card-value">${data.rate || 0}%</span>
            </div>
            <div class="card-row">
              <span class="card-label">Monthly EMI:</span>
              <span class="card-value">₹${parseFloat(data.monthlyEMI || 0).toLocaleString()}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Total Amount:</span>
              <span class="card-value">₹${parseFloat(data.totalAmount || 0).toLocaleString()}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Applied On:</span>
              <span class="card-value">${createdDate}</span>
            </div>
          </div>
        </div>
      `;
      html += card;
    });
    
    loanList.innerHTML = html;
  } catch (error) {
    console.error("Error loading loans:", error);
    loanList.innerHTML = `
      <p style="color: red; padding: 20px;">
        ❌ Error loading loans: ${error.message}
      </p>
    `;
  }
}

// ===============================
// AUTH GUARD
// ===============================
onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname.includes("borrower-loans")) {
    window.location.href = "login.html";
  }
});

document.addEventListener("DOMContentLoaded", loadBorrowerLoans);
