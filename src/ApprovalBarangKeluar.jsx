import { useEffect, useState, useRef } from "react";
import { database } from "./firebase";
import { ref, onValue, update, remove, push, set } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function ApprovalBarangKeluar() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

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

  // =========================
  // EXPORT EXCEL
  // =========================
  const exportExcel = () => {
    const rows = items.map((i) => ({
      "No DO": i.noDO,
      "Part Number": i.partnumber,
      Nama: i.nama,
      Jumlah: i.jumlah,
      Harga: i.harga,
      "Total Harga": i.jumlah * i.harga,
      Peminta: i.peminta,
      Tujuan: i.tujuan,
      Waktu: i.waktu,
      Status: i.status,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Approval Barang Keluar");

    XLSX.writeFile(wb, "approval_barang_keluar.xlsx");
  };

  // =========================
  // IMPORT EXCEL
  // =========================
  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      rows.forEach((r) => {
        const id = push(ref(database, "barangkeluar")).key;

        set(ref(database, "barangkeluar/" + id), {
          id,
          noDO: r["No DO"] || "",
          partnumber: r["Part Number"] || "",
          nama: r["Nama"] || "",
          jumlah: r["Jumlah"] || "",
          harga: r["Harga"] || "",
          totalHarga: r["Total Harga"] || "",
          peminta: r["Peminta"] || "",
          tujuan: r["Tujuan"] || "",
          waktu: r["Waktu"] || "",
          status: r["Status"] || "pending",
        });
      });

      alert("Import berhasil!");
      e.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  // =========================
  // HAPUS SEMUA DATA
  // =========================
  const deleteAll = () => {
    if (!window.confirm("Yakin hapus SEMUA data approval & barang keluar?"))
      return;

    remove(ref(database, "barangkeluar"));
    alert("Semua data telah dihapus!");
  };

  // =========================
  // UI
  // =========================

  return (
    <div style={{ padding: 20 }}>
      <h2>📝 Approval Barang Keluar</h2>

      {/* NAV */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
        <button onClick={() => navigate("/stock-opname")}>📋 Stock Opname</button>

        {/* IMPORT */}
        <button onClick={() => fileRef.current.click()}>⬆ Import Excel</button>
        <input
          type="file"
          ref={fileRef}
          accept=".xlsx,.xls"
          style={{ display: "none" }}
          onChange={importExcel}
        />

        {/* EXPORT */}
        <button onClick={exportExcel}>⬇ Export Excel</button>

        {/* DELETE ALL */}
        <button
          onClick={deleteAll}
          style={{ background: "red", color: "white" }}
        >
          🗑 Hapus Semua Data
        </button>

        {/* LOGOUT */}
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
                {i.status === "pending" && (
                  <>
                    <button onClick={() => setStatus(i.id, "approved")}>
                      ✔ Approve
                    </button>
                    <button onClick={() => setStatus(i.id, "rejected")}>
                      ✖ Reject
                    </button>
                  </>
                )}

                {i.status !== "pending" && (
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
