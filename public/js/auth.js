import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("Auth module loaded");

// Check if already logged in
onAuthStateChanged(auth, (user) => {
  const currentPath = window.location.pathname;
  if (user && (currentPath.includes("login.html") || currentPath.includes("regestier.html"))) {
    console.log("User already logged in, redirecting to dashboard");
    setTimeout(() => window.location.href = "dashboard.html", 100);
  }
});

// Register function
window.register = async function () {
  try {
    console.log("Register function called");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (!nameInput || !emailInput || !passwordInput) {
      console.error("Form elements not found");
      alert("❌ Form elements not found");
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validation
    if (!name || !email || !password) {
      alert("❌ Please fill all fields");
      return;
    }

    if (name.length < 3) {
      alert("❌ Name must be at least 3 characters");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("❌ Please enter a valid email");
      return;
    }

    if (password.length < 6) {
      alert("❌ Password must be at least 6 characters");
      return;
    }

    console.log("Creating user account...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User created:", user.uid);

    // Store user data in Firestore
    console.log("Storing user data in Firestore...");
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      role: "borrower",
      createdAt: new Date()
    });


    alert("✅ Registration successful! Redirecting to login...");
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    setTimeout(() => window.location.href = "login.html", 1500);
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === "auth/email-already-in-use") {
      alert("❌ Email already registered");
    } else if (error.code === "auth/invalid-email") {
      alert("❌ Invalid email format");
    } else if (error.code === "auth/weak-password") {
      alert("❌ Password is too weak");
    } else {
      alert("❌ Registration failed: " + error.message);
    }
  }
};

// Login function
window.login = async function () {
  try {
    console.log("Login function called");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (!emailInput || !passwordInput) {
      console.error("Form elements not found");
      alert("❌ Form elements not found");
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("❌ Please fill all fields");
      return;
    }

    console.log("Signing in user...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in:", user.uid);

    // Get user role and name
    console.log("Fetching user data...");
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length > 0) {
      const userData = querySnapshot.docs[0].data();
      console.log("User data found:", userData);

      localStorage.setItem("userRole", userData.role || "borrower");
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("userName", userData.name || "User");

      alert("✅ Login successful!");
      window.location.href = "dashboard.html";
    } else {
      console.warn("User not found in database");
      alert("❌ User data not found. Please contact support.");
    }
  } catch (error) {
    console.error("Login error:", error);
    if (error.code === "auth/user-not-found") {
      alert("❌ User not found. Please register first.");
    } else if (error.code === "auth/wrong-password") {
      alert("❌ Incorrect password");
    } else if (error.code === "auth/invalid-email") {
      alert("❌ Invalid email format");
    } else {
      alert("❌ Login failed: " + error.message);
    }
  }
};

// Logout function
window.logout = async function () {
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

console.log("Auth functions exported to window");
