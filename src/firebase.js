// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBCc9K2QgIht7rz_JGghrNJ3Zr44t3pelQ",
  authDomain: "sem3-dashboard.firebaseapp.com",
  projectId: "sem3-dashboard",
  storageBucket: "sem3-dashboard.firebasestorage.app",
  messagingSenderId: "737594285126",
  appId: "1:737594285126:web:0fb04ecb7548fcd2f67e47",
  measurementId: "G-ZSRB7C2M08"
};
// 1) تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// 2) تهيئة خدمات Firebase وتصديرها
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
