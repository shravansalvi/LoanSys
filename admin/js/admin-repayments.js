import { auth, db } from "../../public/js/firebase-config.js";

import { onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let repaymentData = [];

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../../public/login.html";
        return;
    }

    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (userSnap.data().role !== "admin") {
        alert("Access denied");
        return;
    }
    // 🔍 Search & Filter Events
    document.getElementById("searchInput")
        .addEventListener("input", filterData);

    document.getElementById("statusFilter")
        .addEventListener("change", filterData);

    // 🔍 Filter Logic
    function filterData() {
        const text =
            document.getElementById("searchInput").value.toLowerCase();
        const status =
            document.getElementById("statusFilter").value;

        const filtered = repaymentData.filter((r) => {
            const matchesText =
                r.userName.toLowerCase().includes(text) ||
                r.loanName.toLowerCase().includes(text);

            const matchesStatus =
                status === "all" || r.status === status;

            return matchesText && matchesStatus;
        });

        renderTable(filtered);
    }

            const snap = await getDocs(collection(db, "repayments"));
            const table = document.getElementById("repaymentTable");
            table.innerHTML = "";

            for (const d of snap.docs) {
                const r = d.data();

                // 1️⃣ Get loan details
                const loanSnap = await getDoc(doc(db, "loans", r.loanId));
                const loan = loanSnap.data();

                // 2️⃣ Get user details
                const userSnap = await getDoc(doc(db, "users", loan.userId));
                const user = userSnap.data();

                repaymentData.push({
                    userName: user.name,
                    loanName: loan.loanName,
                    emi: r.emiNumber,
                    amount: r.amount,
                    status: r.status,
                    paidOn: r.paidOn ? r.paidOn.toDate().toLocaleDateString() : "-"
                });
            }
            renderTable(repaymentData);

            function renderTable(data) {
                const table = document.getElementById("repaymentTable");
                table.innerHTML = "";

                data.forEach((r) => {
                    table.innerHTML += `
      <tr>
        <td>${r.userName}</td>
        <td>${r.loanName}</td>
        <td>EMI ${r.emi}</td>
        <td>₹${r.amount}</td>
        <td>${r.status}</td>
        <td>${r.paidOn}</td>
      </tr>
    `;
                });
            }
        });

