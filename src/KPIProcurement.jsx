// src/KPIProcurement.jsx
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function KPIProcurement() {
  const navigate = useNavigate();
  const [barangMasuk, setBarangMasuk] = useState([]);
  const [month, setMonth] = useState(`${new Date().getMonth()+1}`.padStart(2,"0"));
  const [year, setYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const r = ref(database, "barangMasuk");
    return onValue(r, snap => {
      const v = snap.val() || {};
      setBarangMasuk(Object.values(v));
    });
  }, []);

  // Filter berdasarkan bulan & tahun
  const filtered = barangMasuk.filter(i => {
    const d = new Date(i.waktu);
    return (
      `${d.getMonth()+1}`.padStart(2,"0") === month &&
      d.getFullYear().toString() === year
    );
  });

  // HITUNG KPI
  const totalCost = filtered.reduce((sum, i) => sum + Number(i.totalHarga||0), 0);

  const total = filtered.length;
  const onTime = filtered.filter(i => i.statusDelivery === "OnTime").length;
  const vendorOnTimeRate = total === 0 ? 0 : ((onTime / total) * 100).toFixed(1);

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 KPI Procurement</h2>

      <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>

      <div style={{ marginTop: 20 }}>
        <select value={month} onChange={e => setMonth(e.target.value)}>
          {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select value={year} onChange={e => setYear(e.target.value)}>
          {["2024","2025","2026"].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <h3 style={{ marginTop: 20 }}>📊 Hasil KPI</h3>
      <table border="1" width="100%" cellPadding="6">
        <tbody>
          <tr><td>Total Transaksi</td><td>{total}</td></tr>
          <tr><td>Total Pengeluaran</td><td>Rp {totalCost.toLocaleString()}</td></tr>
          <tr><td>Vendor On-Time Delivery</td><td>{vendorOnTimeRate}%</td></tr>
        </tbody>
      </table>
    </div>
  );
}
