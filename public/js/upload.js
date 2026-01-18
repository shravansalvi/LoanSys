import { auth, db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

async function uploadDoc(event) {
  event.preventDefault();
  
  try {
    const uid = localStorage.getItem("uid");
    if (!uid) {
      alert("❌ Please login first");
      window.location.href = "login.html";
      return;
    }

    const fileInput = document.getElementById("docFile");
    if (!fileInput) {
      console.error("File input not found");
      return;
    }

    const file = fileInput.files?.[0];
    if (!file) {
      alert("❌ Please select a file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("❌ File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert("❌ Invalid file type. Only PDF, DOC, DOCX, JPG, PNG allowed");
      return;
    }

    // Store metadata in Firestore
    await addDoc(collection(db, "documents"), {
      uid: uid,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date(),
      status: "uploaded"
    });

    alert("✅ Document uploaded successfully!");
    fileInput.value = "";
    setTimeout(() => window.location.href = "dashboard.html", 1500);
  } catch (error) {
    console.error("Document upload error:", error);
    alert("❌ Error uploading document: " + error.message);
  }
}

onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname.includes("upload-documents")) {
    window.location.href = "login.html";
  }
});

window.uploadDoc = uploadDoc;
