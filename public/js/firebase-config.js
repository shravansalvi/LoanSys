// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
 apiKey: "Api_key",
  authDomain: "syn.firebaseapp.com",
  projectId: "systn",
  storageBucket: "systemloan.firebasestorage.app",
  messagingSenderId: "488408291435",
  appId: "1:488408291435:web:",
  measurementId: "G-"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
