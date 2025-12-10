// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import "./DashboardSCMCircle.css";



const firebaseConfig = {
  apiKey: "AIzaSyD1bA6IzkWW59GoDcF0qejHKqCYXrRUQTQ",
  authDomain: "sico-inventory-workshop-2025.firebaseapp.com",
  projectId: "sico-inventory-workshop-2025",
  storageBucket: "sico-inventory-workshop-2025.firebasestorage.app",
  messagingSenderId: "117961966670",
  appId: "1:117961966670:web:6376cce2d394c8a9eaef1f",
  measurementId: "G-47R9XRPFH9",

  // 🔥 WAJIB ADA UNTUK REALTIME DATABASE!
  databaseURL:
    "https://sico-inventory-workshop-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
