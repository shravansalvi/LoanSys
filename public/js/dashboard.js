import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("Dashboard module loaded");

async function checkUserAndLoadData() {
  console.log("Checking user authentication...");
  
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log("No user logged in, redirecting to login");
      window.location.href = "login.html";
      return;
    }

    try {
      const uid = user.uid;
      console.log("User logged in:", uid);
      
      localStorage.setItem("uid", uid);

      // Get user data
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("uid", "==", uid));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.docs.length > 0) {
        const userData = userSnapshot.docs[0].data();
        const userRole = userData.role || "borrower";
        
        console.log("User role:", userRole);
        
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userName", userData.name || "User");

        // If user is admin or loan_officer, redirect to admin dashboard
        if (userRole === "admin" || userRole === "loan_officer") {
          console.log("Admin user detected, redirecting to admin dashboard");
          window.location.href = "../admin/admin-dashboard.html";
          return;
        }

        // Show admin section if available
        const adminSection = document.getElementById("adminSection");
        if (adminSection) {
          adminSection.style.display = "none";
        }
      } else {
        console.log("User record not found in database");
      }

      // Load latest loan data for borrower
      const loansRef = collection(db, "loans");
      const loansQuery = query(loansRef, where("uid", "==", uid));

      try {
        const loansSnapshot = await getDocs(loansQuery);
        
        if (!loansSnapshot.empty) {
          const loanData = loansSnapshot.docs[0].data();
          console.log("Loan data found:", loanData);
          
          const loanStatusEl = document.getElementById("loanStatus");
          const emiAmountEl = document.getElementById("emiAmount");
          
          if (loanStatusEl) {
            loanStatusEl.textContent = (loanData.status || "pending").toUpperCase();
          }
          if (emiAmountEl) {
            emiAmountEl.textContent = parseFloat(loanData.monthlyEMI || 0).toLocaleString();
          }
        } else {
          console.log("No loan data found");
          
          const loanStatusEl = document.getElementById("loanStatus");
          const emiAmountEl = document.getElementById("emiAmount");
          if (loanStatusEl) loanStatusEl.textContent = "No Active Loan";
          if (emiAmountEl) emiAmountEl.textContent = "0";
        }
      } catch (err) {
        console.error("Error loading loans:", err);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  });
}

window.logout = async function() {
  try {
    console.log("Logout function called");
    await signOut(auth);
    localStorage.clear();
    alert("✅ Logged out successfully");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("❌ Logout failed: " + error.message);
  }
};

console.log("Dashboard functions exported");
document.addEventListener("DOMContentLoaded", checkUserAndLoadData);
