import { useEffect, useState } from "react";
import { database } from "./firebase";
import {
  ref,
  onValue,
  update
} from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function ApprovalBarangKeluar() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [permintaan, setPermintaan] = useState([]);
  const [items, setItems] = useState([]);

  // ======================
  // AUTH GUARD
  // ======================
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // ======================
  // LOAD INVENTORY
  // ======================
  useEffect(() => {
    const r = ref(database, "items");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setItems(Object.values(data));
    });
  }, []);

  // ======================
  // LOAD PERMINTAAN BARANG KELUAR
  // ======================
  useEffect(() => {
    const r = ref(database, "barangKeluar");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setPermintaan(Object.values(data));
    });
  }, []);

  if (loadingAuth) return <p>Checking login…</p>;

  // ======================
  // APPROVE
  // ======================
  const approve = (p) => {
    const item = items.find((x) => x.id === p.idItem);
    if (!item) return alert("Barang tidak ditemukan!");

    if (item.stok < p.jumlah) {
      return alert("❌ Stok tidak cukup untuk approve!");
    }

    // KURANGI STOK
    update(ref(database, "items/" + item.id), {
      stok: item.stok - p.jumlah,
    });

    // UPDATE STATUS PERMINTAAN
    update(ref(database, "barangKeluar/" + p.id), {
      status: "approved",
      waktu_approve: Date.now(),
    });

    alert("✔ Permintaan disetujui");
  };

  // ======================
  // REJECT
  // ======================
  const reject = (p) => {
    update(ref(database, "barangKeluar/" + p.id), {
      status: "rejected",
      waktu_reject: Date.now(),
    });

    alert("✔ Permintaan ditolak");
  };

  // ======================
  // EXPORT
  // ======================
  const exportExcel = () => {
    const data = permintaan.map((p) => ({
      "Nama Barang": p.nama,
      "Jumlah": p.jumlah,
      "Peminta": p.peminta,
      "Tujuan": p.tujuan,
      "Status": p.status || "pending",
      "Waktu": new Date(p.waktu).toLocaleString(),
      "Keterangan": p.keterangan,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Approval");
    XLSX.writeFile(wb, "approval_barang_keluar.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📝 Approval Barang Keluar</h2>

      {/* NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
        <button onClick={() => navigate("/stock-opname")}>📋 Stock Opname</button>
        <button onClick={() => navigate("/field-inventory")}>🧭 Field Inventory</button>

        <button onClick={exportExcel}>⬇ Export Excel</button>

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

      <h3>Daftar Permintaan Barang Keluar</h3>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Nama Barang</th>
            <th>Jumlah</th>
            <th>Peminta</th>
            <th>Tujuan</th>
            <th>Keterangan</th>
            <th>Status</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {permintaan
            .sort((a, b) => b.waktu - a.waktu)
            .map((p) => (
              <tr key={p.id}>
                <td>{p.nama}</td>
                <td>{p.jumlah}</td>
                <td>{p.peminta}</td>
                <td>{p.tujuan}</td>
                <td>{p.keterangan}</td>
                <td>
                  {p.status === "approved"
                    ? "✔ Approved"
                    : p.status === "rejected"
                    ? "❌ Rejected"
                    : "⏳ Pending"}
                </td>
                <td>{new Date(p.waktu).toLocaleString()}</td>

                <td>
                  {p.status ? (
                    "-"
                  ) : (
                    <>
                      <button onClick={() => approve(p)}>Approve</button>
                      <button onClick={() => reject(p)}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
