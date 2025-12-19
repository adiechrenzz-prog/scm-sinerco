import { useEffect, useState } from "react";
import { auth, database } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { Navigate } from "react-router-dom";

export default function ProtectedField({ children, field }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userField, setUserField] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Ambil data field user dari database
        const snap = await get(ref(database, "users/" + currentUser.uid));
        if (snap.exists()) {
          setUserField(snap.val().field);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Checking Access...</div>;

  // Jika belum login, tendang ke login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada pengecekan spesifik field (opsional)
  // Misalnya: User Jatibarang mencoba akses Dashboard HO
  if (field && userField && field !== userField) {
    // Izinkan admin/ho akses semua, jika bukan, arahkan ke dashboard yang benar
    if (userField !== "ho") {
        alert("Anda tidak memiliki akses ke field ini!");
        return <Navigate to={`/dashboard-${userField}`} replace />;
    }
  }

  return children;
}