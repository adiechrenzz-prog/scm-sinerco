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
      // Sinkronisasi ulang userData dari localStorage jika ada perubahan sesi
      const saved = localStorage.getItem("user_field_data");
      if (saved) setUserData(JSON.parse(saved));
      
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null; // Layar kosong singkat saat cek login

  // 1. Jika belum login di Firebase, lempar ke login
  if (!user) return <Navigate to="/login" replace />;

  // 2. Jika rute tidak meminta field spesifik (seperti Dashboard Utama), izinkan akses
  if (!field) return children;

  // 3. Cek Hak Akses (Untuk Admin atau Field yang sesuai)
  const isAuthorized = userData?.field === "admin" || userData?.field === field;

  if (!isAuthorized) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
        <h2 style={{ color: "#e11d48" }}>AKSES DITOLAK</h2>
        <p>Anda tidak memiliki izin untuk mengakses area <b>{field?.toUpperCase()}</b>.</p>
        <p style={{ fontSize: "12px", color: "#666" }}>Role Anda: {userData?.field?.toUpperCase() || "Tidak Diketahui"}</p>
        <button 
          onClick={() => window.location.href = "/dashboard-scm"} 
          style={{ cursor: "pointer", padding: "10px 20px", marginTop: "10px", backgroundColor: "#800020", color: "#fff", border: "none", borderRadius: "5px" }}
        >
          Kembali ke Dashboard Utama
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedField;