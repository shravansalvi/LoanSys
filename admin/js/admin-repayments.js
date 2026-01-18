import { db, auth } from "../../public/js/firebase-config.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let allRepayments = [];
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
    loadRepayments();
  } catch (error) {
    console.error("Auth check error:", error);
    window.location.href = "../../public/dashboard.html";
  }
});

async function loadRepayments() {
  try {
    const snapshot = await getDocs(collection(db, "emiPayments"));
    allRepayments = [];
    
    snapshot.forEach((doc) => {
      allRepayments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    displayRepayments(allRepayments);
  } catch (error) {
    console.error("Error loading repayments:", error);
    document.getElementById("repaymentTable").innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: red; padding: 20px;">
          ❌ Error loading repayments
        </td>
      </tr>
    `;
  }
}

function displayRepayments(repayments) {
  const table = document.getElementById("repaymentTable");
  
  if (!table) {
    console.error("repaymentTable element not found");
    return;
  }

  table.innerHTML = "";

  if (repayments.length === 0) {
    table.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999; padding: 20px;">📭 No repayments found</td></tr>';
    return;
  }

  let html = "";
  repayments.forEach((payment) => {
    const paidDate = payment.paidOn?.toDate?.() 
      ? new Date(payment.paidOn.toDate()).toLocaleDateString("en-IN") 
      : "Pending";
    
    const statusBadge = `<span class="badge badge-${payment.status || 'pending'}">${(payment.status || 'pending').toUpperCase()}</span>`;
    
    const row = `
      <tr>
        <td>${payment.userName || "N/A"}</td>
        <td>${payment.loanId || "N/A"}</td>
        <td>${payment.emiNo || "N/A"}</td>
        <td>₹${parseFloat(payment.amount || 0).toLocaleString()}</td>
        <td>${statusBadge}</td>
        <td>${paidDate}</td>
      </tr>
    `;
    html += row;
  });
  
  table.innerHTML = html;
}

function filterRepayments() {
  const searchInput = document.getElementById("searchInput")?.value?.toLowerCase() || "";
  const statusFilter = document.getElementById("statusFilter")?.value || "";

  const filtered = allRepayments.filter((rep) => {
    const matchesSearch = (rep.userName?.toLowerCase() || "").includes(searchInput) || 
                         (rep.loanId?.toLowerCase() || "").includes(searchInput);
    const matchesStatus = statusFilter === "" || rep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  displayRepayments(filtered);
}

async function logout() {
  try {
    const { signOut } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
    await signOut(auth);
    localStorage.clear();
    alert("✅ Logged out successfully");
    window.location.href = "../../public/login.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

window.logout = logout;

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  
  if (searchInput) searchInput.addEventListener("input", filterRepayments);
  if (statusFilter) statusFilter.addEventListener("change", filterRepayments);
});

