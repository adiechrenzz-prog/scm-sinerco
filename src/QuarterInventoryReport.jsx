// src/QuarterInventoryReport.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function QuarterInventoryReport() {
  const navigate = useNavigate();

  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(4);
  const [data, setData] = useState([]);

  // ============================
  // LOAD BARANG MASUK & KELUAR
  // ============================
  useEffect(() => {
    const r1 = ref(database, "barangmasuk");
    const r2 = ref(database, "barangkeluar");

    onValue(r1, (snap) => {
      const d = snap.val() || {};
      const arr = Object.values(d).map((i) => ({ ...i, type: "IN" }));

      setData((old) => [...old.filter((x) => x.type !== "IN"), ...arr]);
    });

    onValue(r2, (snap) => {
      const d = snap.val() || {};
      const arr = Object.values(d).map((i) => ({ ...i, type: "OUT" }));

      setData((old) => [...old.filter((x) => x.type !== "OUT"), ...arr]);
    });
  }, []);

  // ============================
  // FILTER BY QUARTER
  // ============================
  const getQuarterRange = () => {
    if (quarter === 1) return ["01", "02", "03"];
    if (quarter === 2) return ["04", "05", "06"];
    if (quarter === 3) return ["07", "08", "09"];
    return ["10", "11", "12"];
  };

  const months = getQuarterRange();

  const report = data.filter((i) => {
    if (!i.waktu) return false;

    const y = i.waktu.substring(0, 4);
    const m = i.waktu.substring(5, 7);

    return y == year && months.includes(m);
  });

  // ============================
  // PERHITUNGAN TOTAL
  // ============================
  const getTotalHarga = (item) => {
    if (item.totalharga && !isNaN(item.totalharga))
      return Number(item.totalharga);

    return Number(item.harga || 0) * Number(item.jumlah || 0);
  };

  const totalPengeluaran = report.reduce(
    (sum, i) => sum + getTotalHarga(i),
    0
  );

  // ============================
  // EXPORT EXCEL
  // ============================
  const exportExcel = () => {
    const rows = report.map((i) => ({
      "Part Number": i.partnumber,
      "Nama Barang": i.nama,
      Jumlah: i.jumlah,
      Harga: i.harga,
      "Total Harga": getTotalHarga(i),
      Tanggal: i.waktu,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Q${quarter} ${year}`);
    XLSX.writeFile(wb, `QuarterInventory_Q${quarter}_${year}.xlsx`);
  };

  // ============================
  // EXPORT PDF
  // ============================
  const exportPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");

    doc.text(`Quarterly Inventory Report - Q${quarter} ${year}`, 40, 40);

    const tableData = report.map((i) => [
      i.partnumber,
      i.nama,
      i.jumlah,
      i.harga,
      getTotalHarga(i),
      i.waktu,
    ]);

    doc.autoTable({
      head: [["Part Number", "Nama", "Jumlah", "Harga", "Total Harga", "Tanggal"]],
      body: tableData,
      startY: 60,
    });

    doc.text(
      `Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString()}`,
      40,
      doc.lastAutoTable.finalY + 30
    );

    doc.save(`QuarterInventory_Q${quarter}_${year}.pdf`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Quarterly Inventory Report</h2>

      <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>

      <hr />

      {/* FILTER */}
      <div style={{ marginBottom: 20 }}>
        <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>
          <option value={1}>Quarter 1</option>
          <option value={2}>Quarter 2</option>
          <option value={3}>Quarter 3</option>
          <option value={4}>Quarter 4</option>
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ marginLeft: 10 }}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const y = 2023 + i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>

        <button onClick={exportExcel} style={{ marginLeft: 20 }}>
          ⬇ Excel
        </button>
        <button onClick={exportPDF} style={{ marginLeft: 10 }}>
          ⬇ PDF
        </button>
      </div>

      <h3>
        📊 Hasil Laporan - Q{quarter} {year}
      </h3>

      {/* TABLE */}
      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama</th>
            <th>Jumlah</th>
            <th>Harga</th>
            <th>Total Harga</th>
            <th>Tanggal</th>
          </tr>
        </thead>

        <tbody>
          {report.map((i, idx) => (
            <tr key={idx}>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.jumlah}</td>
              <td>{i.harga}</td>
              <td>{getTotalHarga(i)}</td>
              <td>{i.waktu}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 15 }}>
        💰 Total Pengeluaran: <b>Rp {totalPengeluaran.toLocaleString()}</b>
      </h3>
    </div>
  );
}
