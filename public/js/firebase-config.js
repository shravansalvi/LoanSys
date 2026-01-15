// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
 apiKey: "AIzaSyDizSRSsBSeWvduqRWk45BTnMtnHP_WyYI",
  authDomain: "systemloan.firebaseapp.com",
  projectId: "systemloan",
  storageBucket: "systemloan.firebasestorage.app",
  messagingSenderId: "488408291435",
  appId: "1:488408291435:web:e3786c9bb440e0f6e4b92e",
  measurementId: "G-9DT46H7KQ3"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
