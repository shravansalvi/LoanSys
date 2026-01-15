import { auth } from "./firebase-config.js";

import {
  getStorage,
  ref,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const storage = getStorage();

let userId = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    userId = user.uid;
  }
});

window.uploadDoc = async function () {
  const file = document.getElementById("docFile").files[0];

  if (!file) {
    alert("Select a file");
    return;
  }

  const fileRef = ref(storage, `documents/${userId}/${file.name}`);
  await uploadBytes(fileRef, file);

  alert("Document Uploaded Successfully");
};
