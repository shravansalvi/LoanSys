import { auth, db } from "../../public/js/firebase-config.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadLoans(user.uid);
});

async function loadLoans(uid) {
  const loanList = document.getElementById("loanList");
  loanList.innerHTML = "Loading loans...";

  const q = query(
    collection(db, "loans"),
    where("userId", "==", uid)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    loanList.innerHTML = "No loans found";
    return;
  }

  loanList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const loan = docSnap.data();

    loanList.innerHTML += `
      <div style="border:1px solid #000; padding:10px; margin:10px;">
        <p><b>Amount:</b> ₹${loan.loanAmount}</p>
        <p><b>Status:</b> ${loan.status}</p>
        ${loan.status === "approved" && loan.emi
          ? `<p><b>EMI:</b> ₹${loan.emi}</p>`
          : ""
        }
      </div>
    `;
  });
}
