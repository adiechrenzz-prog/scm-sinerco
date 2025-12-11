import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function SisaStok() {
  const navigate = useNavigate();
  const [loadingAuth, setLoadingAuth] = useState(true);
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
      const list = Object.values(data);
      setItems(list);
    });
  }, []);

  if (loadingAuth) return <p>Checking login…</p>;

  // ======================
  // EXPORT EXCEL LAPORAN
  // ======================
  const exportExcel = () => {
    const data = items.map((i) => ({
      "Part Number": i.partnumber,
      "Nama Barang": i.nama,
      "Stok Tersedia": i.stok,
      Satuan: i.satuan,
      Gudang: i.gudang,
      Rack: i.rack,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sisa Stok");
    XLSX.writeFile(wb, "sisa_stok.xlsx");
  };

  // SORT
  const sorted = [...items].sort(
    (a, b) => Number(a.partnumber) - Number(b.partnumber)
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Laporan Sisa Stok</h2>

      {/* NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/approval-barang-keluar")}>📝 Approval</button>
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

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Stok</th>
            <th>Satuan</th>
            <th>Gudang</th>
            <th>Rack</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((i) => (
            <tr key={i.id}>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.stok}</td>
              <td>{i.satuan}</td>
              <td>{i.gudang}</td>
              <td>{i.rack}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
