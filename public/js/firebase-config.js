// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
 // API Config
 apiKey: "AIzaSyDizSRSsBSeWvduqRWk45BTnMtnHP_WyYI",
  authDomain: "systemloan.firebaseapp.com",
  projectId: "systemloan",
  storageBucket: "systemloan.firebasestorage.app",
  messagingSenderId: "488408291435",
  appId: "1:488408291435:web:e3786c9bb440e0f6e4b92e",
  measurementId: "G-9DT46H7KQ3"
};

let app, auth, db, analytics;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Try to initialize analytics, but don't fail if it doesn't work
  try {
    analytics = getAnalytics(app);
  } catch (analyticsError) {
    console.warn("Analytics not available:", analyticsError);
  }
  
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  throw new Error("Firebase initialization failed: " + error.message);
}

export { app, auth, db, analytics };
