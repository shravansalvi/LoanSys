import { db, auth } from "../../public/js/firebase-config.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
      console.log("User not found in database");
      window.location.href = "../../public/dashboard.html";
      return;
    }

    const userData = userSnapshot.docs[0].data();
    const userRole = userData.role || "borrower";

    if (userRole !== "admin" && userRole !== "loan_officer") {
      console.log("User is not admin or loan officer, role:", userRole);
      window.location.href = "../../public/dashboard.html";
      return;
    }

    isAuthorized = true;
    loadAnalytics();
  } catch (error) {
    console.error("Auth check error:", error);
    window.location.href = "../../public/dashboard.html";
  }
});

async function loadAnalytics() {
  try {
    // Load total loans
    const loansSnapshot = await getDocs(collection(db, "loans"));
    document.getElementById("totalLoans").textContent = loansSnapshot.size;

    // Load approved loans
    const approvedQuery = query(collection(db, "loans"), where("status", "==", "approved"));
    const approvedSnapshot = await getDocs(approvedQuery);
    document.getElementById("approvedLoans").textContent = approvedSnapshot.size;

    // Load closed loans
    const closedQuery = query(collection(db, "loans"), where("status", "==", "closed"));
    const closedSnapshot = await getDocs(closedQuery);
    document.getElementById("closedLoans").textContent = closedSnapshot.size;

    // Load EMI analytics
    const emisSnapshot = await getDocs(collection(db, "emiPayments"));
    document.getElementById("totalEmis").textContent = emisSnapshot.size;

    const paidQuery = query(collection(db, "emiPayments"), where("status", "==", "paid"));
    const paidSnapshot = await getDocs(paidQuery);
    document.getElementById("paidEmis").textContent = paidSnapshot.size;

    const pendingCount = emisSnapshot.size - paidSnapshot.size;
    document.getElementById("pendingEmis").textContent = pendingCount;

    // Initialize Charts
    initCharts(
      approvedSnapshot.size,
      closedSnapshot.size,
      loansSnapshot.size - approvedSnapshot.size - closedSnapshot.size,
      paidSnapshot.size,
      pendingCount
    );
  } catch (error) {
    console.error("Error loading analytics:", error);
  }
}

function initCharts(approved, closed, pending, paid, unpaid) {
  // Loan Status Pie Chart
  const loanCtx = document.getElementById("loanPieChart");
  if (loanCtx) {
    new Chart(loanCtx, {
      type: "pie",
      data: {
        labels: ["Approved", "Closed", "Pending"],
        datasets: [{
          data: [approved, closed, pending],
          backgroundColor: ["#28a745", "#667eea", "#ffc107"],
          borderColor: ["#fff", "#fff", "#fff"],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }

  // EMI Payment Bar Chart
  const emiCtx = document.getElementById("emiBarChart");
  if (emiCtx) {
    new Chart(emiCtx, {
      type: "bar",
      data: {
        labels: ["Paid", "Pending"],
        datasets: [{
          label: "EMI Count",
          data: [paid, unpaid],
          backgroundColor: ["#28a745", "#dc3545"],
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: "top"
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
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
    alert("❌ Logout failed");
  }
}

window.logout = logout;
document.addEventListener("DOMContentLoaded", () => {
  if (isAuthorized) {
    loadAnalytics();
  }
});
