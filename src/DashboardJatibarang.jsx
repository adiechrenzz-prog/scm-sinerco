import { useEffect, useState } from "react";
import { database, auth } from "./firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

export default function DashboardJatibarang() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Ambil data khusus Jatibarang dari Realtime Database
    const dataRef = ref(database, "inventory/jatibarang");
    const unsubscribe = onValue(dataRef, (snapshot) => {
      setData(snapshot.val());
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/login"));
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Dashboard Jatibarang</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.card}>
        <h3>Status Inventaris</h3>
        {data ? (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>Memuat data...</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", backgroundColor: "#f4f4f4", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  card: { padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  logoutBtn: { padding: "8px 16px", backgroundColor: "#7b003f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }
};