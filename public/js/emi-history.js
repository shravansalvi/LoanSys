import { auth, db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

async function loadEMIHistory() {
  const historyTable = document.getElementById("historyTable");
  
  if (!historyTable) {
    console.error("historyTable element not found");
    return;
  }

  try {
    const uid = localStorage.getItem("uid");
    if (!uid) {
      window.location.href = "login.html";
      return;
    }

    const historyQuery = query(
      collection(db, "emiPayments"),
      where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(historyQuery);
    historyTable.innerHTML = "";

    if (querySnapshot.empty) {
      historyTable.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #999; padding: 20px;">
            📭 No payment history
          </td>
        </tr>
      `;
      return;
    }

    let html = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const paidDate = data.paidOn?.toDate?.() 
        ? new Date(data.paidOn.toDate()).toLocaleDateString("en-IN") 
        : "N/A";

      const row = `
        <tr>
          <td>EMI #${data.emiNo || doc.id}</td>
          <td>₹${parseFloat(data.amount || 0).toLocaleString()}</td>
          <td><span class="badge badge-paid">✅ Paid</span></td>
          <td>${paidDate}</td>
        </tr>
      `;
      html += row;
    });
    
    historyTable.innerHTML = html;
  } catch (error) {
    console.error("Error loading EMI history:", error);
    historyTable.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: red; padding: 20px;">
          ❌ Error loading history
        </td>
      </tr>
    `;
  }
}

onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname.includes("emi-history")) {
    window.location.href = "login.html";
  }
});

document.addEventListener("DOMContentLoaded", loadEMIHistory);
