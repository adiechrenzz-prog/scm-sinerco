import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, update } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ApprovalBarangKeluar() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);

  // AUTH
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // LOAD DATA
  useEffect(() => {
    const r = ref(database, "barangkeluar");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setItems(Object.values(data));
    });
  }, []);

  if (loadingAuth) return <p>Checking login...</p>;

  // CHANGE STATUS
  const setStatus = (id, status) => {
    update(ref(database, "barangkeluar/" + id), { status });
  };

  // === UI ===

  return (
    <div style={{ padding: 20 }}>
      <h2>📝 Approval Barang Keluar</h2>

      {/* NAVIGATION */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
        <button onClick={() => navigate("/stock-opname")}>📋 Stock Opname</button>

        <button
          onClick={() => {
            signOut(auth);
            navigate("/login");
          }}
          style={{ marginLeft: "auto" }}
        >
          Logout
        </button>
      </div>

      <hr />

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>No DO</th>
            <th>Part Number</th>
            <th>Nama</th>
            <th>Jumlah</th>
            <th>Harga</th>
            <th>Total Harga</th>
            <th>Peminta</th>
            <th>Tujuan</th>
            <th>Waktu</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {items.map((i) => (
            <tr
              key={i.id}
              style={{
                background:
                  i.status === "approved"
                    ? "#d4ffd4"
                    : i.status === "rejected"
                    ? "#ffd4d4"
                    : "white",
              }}
            >
              <td>{i.noDO}</td>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.jumlah}</td>
              <td>{i.harga}</td>
              <td>{i.jumlah * i.harga}</td>
              <td>{i.peminta}</td>
              <td>{i.tujuan}</td>
              <td>{i.waktu}</td>

              <td style={{ fontWeight: "bold" }}>{i.status}</td>

              <td>
                {/* STATUS CONTROL ONLY */}
                {i.status === "pending" && (
                  <>
                    <button onClick={() => setStatus(i.id, "approved")}>✔ Approve</button>
                    <button onClick={() => setStatus(i.id, "rejected")}>✖ Reject</button>
                  </>
                )}

                {i.status === "approved" && (
                  <button onClick={() => setStatus(i.id, "pending")}>
                    🔄 Kembalikan ke Pending
                  </button>
                )}

                {i.status === "rejected" && (
                  <button onClick={() => setStatus(i.id, "pending")}>
                    🔄 Kembalikan ke Pending
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
