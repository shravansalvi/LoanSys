import { db, auth } from "../../public/js/firebase-config.js";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let isAuthorized = false;

// Check if user is admin
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../../public/login.html";
    return;
  }

  try {
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("uid", "==", user.uid));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      window.location.href = "../../public/dashboard.html";
      return;
    }

    const userData = userSnapshot.docs[0].data();
    const userRole = userData.role || "borrower";

    if (userRole !== "admin" && userRole !== "loan_officer") {
      window.location.href = "../../public/dashboard.html";
      return;
    }

    isAuthorized = true;
  } catch (error) {
    console.error("Auth check error:", error);
    window.location.href = "../../public/dashboard.html";
  }
});

async function loadPendingLoans() {
  try {
    const pendingQuery = query(
      collection(db, "loans"),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(pendingQuery);
    const loanList = document.getElementById("loanList");

    if (!loanList) {
      console.error("loanList element not found");
      return;
    }

    loanList.innerHTML = "";

    if (querySnapshot.empty) {
      loanList.innerHTML =
        '<p style="text-align: center; color: #999; padding: 20px;">✅ No pending loans</p>';
      return;
    }

    let html = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const appliedDate = data.createdAt?.toDate?.()
        ? new Date(data.createdAt.toDate()).toLocaleDateString("en-IN")
        : "N/A";

      const card = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${data.loanName || "Loan"}</h3>
          </div>
          <div class="card-content">
            <div class="card-row">
              <span class="card-label">Applicant:</span>
              <span class="card-value">${data.userName || "N/A"}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Amount:</span>
              <span class="card-value">₹${parseFloat(
                data.amount || 0
              ).toLocaleString()}</span>
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
              <span class="card-value">₹${parseFloat(
                data.monthlyEMI || 0
              ).toLocaleString()}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Applied On:</span>
              <span class="card-value">${appliedDate}</span>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
              <button class="btn btn-success" onclick="approveLoan('${doc.id}')">✅ Approve</button>
              <button class="btn btn-danger" onclick="rejectLoan('${doc.id}')">❌ Reject</button>
            </div>
          </div>
        </div>
      `;
      html += card;
    });

    loanList.innerHTML = html;
  } catch (error) {
    console.error("Error loading loans:", error);
    document.getElementById("loanList").innerHTML =
      '<p style="color: red; padding: 20px;">❌ Error loading loans: ' +
      error.message +
      "</p>";
  }
}

async function approveLoan(loanId) {
  try {
    const confirmed = confirm("Are you sure you want to approve this loan?");
    if (!confirmed) return;

    await updateDoc(doc(db, "loans", loanId), {
      status: "approved",
    });
    alert("✅ Loan approved successfully!");
    loadPendingLoans();
  } catch (error) {
    console.error("Error approving loan:", error);
    alert("❌ Error approving loan: " + error.message);
  }
}

async function rejectLoan(loanId) {
  try {
    const reason = prompt("Enter reason for rejection (optional):");

    await updateDoc(doc(db, "loans", loanId), {
      status: "rejected",
      rejectionReason: reason || "Not specified",
    });
    alert("✅ Loan rejected!");
    loadPendingLoans();
  } catch (error) {
    console.error("Error rejecting loan:", error);
    alert("❌ Error rejecting loan: " + error.message);
  }
}

async function logout() {
  try {
    const { signOut } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
    );
    await signOut(auth);
    localStorage.clear();
    alert("✅ Logged out successfully");
    window.location.href = "../../public/login.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

window.approveLoan = approveLoan;
window.rejectLoan = rejectLoan;
window.logout = logout;

document.addEventListener("DOMContentLoaded", () => {
  if (isAuthorized) {
    loadPendingLoans();
  }
});
