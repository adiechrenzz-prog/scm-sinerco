// src/KPIInventory.jsx
import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";

export default function KPIInventory() {
  const [items, setItems] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const [month, setMonth] = useState("2025-01");

  // ============================
  // LOAD DATA (Inventory, Barang Masuk, Barang Keluar)
  // ============================
  useEffect(() => {
    onValue(ref(database, "items"), (snap) => {
      const val = snap.val() || {};
      setItems(Object.values(val));
    });

    onValue(ref(database, "barangmasuk"), (snap) => {
      const val = snap.val() || {};
      setIncoming(Object.values(val));
    });

    onValue(ref(database, "barangkeluar"), (snap) => {
      const val = snap.val() || {};
      setOutgoing(Object.values(val));
    });
  }, []);

  // Helper: format contoh 2025-01 → Januari 2025
  const monthName = (m) => {
    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const [y, mm] = m.split("-");
    return `${bulan[Number(mm) - 1]} ${y}`;
  };

  // ============================
  // FILTER DATA PER BULAN (FIXED)
  // ============================
  const filterByMonth = (arr) =>
    arr.filter((x) =>
      String(x.waktu || "").startsWith(month) // <— FIX ERROR
    );

  const inThisMonth = filterByMonth(incoming);
  const outThisMonth = filterByMonth(outgoing);

  // ============================
  // KPI PERHITUNGAN
  // ============================
  const totalIncoming = inThisMonth.reduce(
    (sum, i) => sum + Number(i.jumlah || 0),
    0
  );

  const totalOutgoing = outThisMonth.reduce(
    (sum, i) => sum + Number(i.jumlah || 0),
    0
  );

  const stockBalance =
    items.reduce((sum, i) => sum + Number(i.stok || 0), 0) || 0;

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 KPI – Inventory</h2>

      {/* NAVIGATION */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <button onClick={() => (window.location.href = "/dashboard")}>
          ⬅ Dashboard
        </button>

        <button onClick={() => (window.location.href = "/kpi-procurement")}>
          📦 KPI Procurement
        </button>

        <button onClick={() => (window.location.href = "/kpi-maintenance")}>
          🛠 KPI Maintenance
        </button>

        <button onClick={() => (window.location.href = "/kpi-monthly-chart")}>
          📈 KPI Monthly Chart
        </button>

        <button onClick={() => (window.location.href = "/kpi-target-actual")}>
          🎯 KPI Target vs Actual
        </button>
      </div>

      {/* SELECT BULAN */}
      <div style={{ marginBottom: 20 }}>
        <label>Pilih Bulan: </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        <b style={{ marginLeft: 10 }}>{monthName(month)}</b>
      </div>

      {/* KPI SUMMARY */}
      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th>KPI</th>
            <th>Nilai</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Barang Masuk</td>
            <td>{totalIncoming}</td>
          </tr>

          <tr>
            <td>Total Barang Keluar</td>
            <td>{totalOutgoing}</td>
          </tr>

          <tr>
            <td>Saldo Stok Sistem</td>
            <td>{stockBalance}</td>
          </tr>

          <tr>
            <td>Turn Over Ratio</td>
            <td>
              {stockBalance > 0
                ? (totalOutgoing / stockBalance).toFixed(2)
                : "0"}
            </td>
          </tr>

          <tr>
            <td>Stock Aging (Estimasi)</td>
            <td>{stockBalance - totalOutgoing}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: 12, color: "#666" }}>
        ⚠ Catatan: perhitungan dibuat best-effort berdasarkan struktur
        data sekarang. Untuk KPI yang lebih presisi (aging harian atau
        stok historis), perlu pencatatan stok per transaksi.
      </p>
    </div>
  );
}
