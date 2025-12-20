import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const ProtectedField = ({ children, field }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(() => {
    // Mengambil cache role agar tidak blank/kedip
    const saved = localStorage.getItem("user_field_data");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null; // Layar kosong singkat saat cek login

  // Jika belum login, lempar ke login
  if (!user) return <Navigate to="/login" replace />;

  // Cek Hak Akses
  const isAuthorized = userData?.field === "admin" || userData?.field === field;

  if (!isAuthorized) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
        <h2 style={{ color: "#e11d48" }}>AKSES DITOLAK</h2>
        <p>Anda tidak memiliki izin untuk mengakses area ini.</p>
        <button onClick={() => window.location.href = "/login"} style={{ cursor: "pointer", padding: "10px" }}>
          Kembali ke Login
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedField;