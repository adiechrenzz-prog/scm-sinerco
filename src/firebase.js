// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore"; // Tambahan untuk Cloud Firestore
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD1bA6IzkWW59GoDcF0qejHKqCYXrRUQTQ",
  authDomain: "sico-inventory-workshop-2025.firebaseapp.com",
  projectId: "sico-inventory-workshop-2025",
  storageBucket: "sico-inventory-workshop-2025.firebasestorage.app",
  messagingSenderId: "117961966670",
  appId: "1:117961966670:web:6376cce2d394c8a9eaef1f",
  measurementId: "G-47R9XRPFH9",
  databaseURL: "https://sico-inventory-workshop-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const database = getDatabase(app); // Realtime Database
export const db = getFirestore(app);       // Cloud Firestore (Untuk Role Admin)
export const storage = getStorage(app);