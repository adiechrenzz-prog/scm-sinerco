import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SisaStok() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  // ======================
  // LOAD INVENTORY (CURRENT STOCK)
  // ======================
  useEffect(() => {
    return onValue(ref(database, "items"), (snap) => {
      const data = snap.val() || {};
      setItems(Object.values(data));
    });
  }, []);

  // ======================
  // HITUNG SISA STOCK
  // ======================
  // Konsep sekarang:
  // items.stok SUDAH berisi sisa stock real-time
  // (stok awal + barang masuk - barang keluar approved)
  const dataSisa = items.map((i) => {
    const stok = Number(i.stok || 0);
    const harga = Number(i.harga || 0);

    return {
      partnumber: i.partnumber,
      nama: i.nama,
      stok,
      satuan: i.satuan,
      harga,
      total: stok * harga,
      gudang: i.gudang || "",
      rack: i.rack || "",
    };
  });

  // ======================
  // EXPORT EXCEL
  // ======================
  const printExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataSisa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sisa Stock");
    XLSX.writeFile(wb, "sisa_stock.xlsx");
  };

  // ======================
  // EXPORT PDF
  // ======================
  const printPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Sisa Stock", 14, 14);

    autoTable(doc, {
      startY: 20,
      head: [[
        "Part Number",
        "Nama Barang",
        "Stok",
        "Satuan",
        "Harga",
        "Total Harga",
        "Gudang",
        "Rack"
      ]],
      body: dataSisa.map((d) => ([
        d.partnumber,
        d.nama,
        d.stok,
        d.satuan,
        d.harga,
        d.total,
        d.gudang,
        d.rack,
      ])),
    });

    doc.save("sisa_stock.pdf");
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Sisa Stock</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>📥 Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>📤 Barang Keluar</button>
        <button onClick={() => navigate("/approval-barang-keluar")}>
          ✅ Approval
        </button>
      </div>

      <hr />

      <button onClick={printExcel}>🟢 Print Excel</button>
      <button onClick={printPDF} style={{ marginLeft: 8 }}>
        🔴 Print PDF
      </button>

      <hr />

      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Stok</th>
            <th>Satuan</th>
            <th>Harga</th>
            <th>Total Harga</th>
            <th>Gudang</th>
            <th>Rack</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {dataSisa.map((d, idx) => (
            <tr key={idx}>
              <td>{d.partnumber}</td>
              <td>{d.nama}</td>
              <td>{d.stok}</td>
              <td>{d.satuan}</td>
              <td>{d.harga}</td>
              <td>{d.total}</td>
              <td>{d.gudang}</td>
              <td>{d.rack}</td>
              <td>
                <button onClick={() => navigate("/inventory")}>
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
