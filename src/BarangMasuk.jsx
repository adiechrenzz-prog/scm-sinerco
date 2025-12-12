// BarangMasuk.jsx — Versi Baru & Simple

import { useState, useEffect, useRef } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set, remove } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function BarangMasuk() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const today = new Date().toISOString().substring(0, 10);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [data, setData] = useState([]);
  const [masterPart, setMasterPart] = useState([]);
  const [masterSupplier, setMasterSupplier] = useState([]);

  const [searchPart, setSearchPart] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");

  const [form, setForm] = useState({
    nomor: "",
    partnumber: "",
    nama: "",
    jumlah: "",
    harga: "",
    total: "",
    supplier: "",
    invoice: "",
    waktu: today,
    ket: "",
  });

  // AUTH
  useEffect(() =>
    onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    })
  , []);

  // LOAD DATA BARANG MASUK
  useEffect(() =>
    onValue(ref(database, "barangmasuk"), (snap) => {
      const d = snap.val() || {};
      const arr = Object.values(d);
      setData(arr);
    })
  , []);

  // LOAD MASTER DATA PART
  useEffect(() =>
    onValue(ref(database, "datasparepart"), (snap) => {
      const d = snap.val() || {};
      setMasterPart(Object.values(d));
    })
  , []);

  // LOAD MASTER SUPPLIER
  useEffect(() =>
    onValue(ref(database, "supplier"), (snap) => {
      const d = snap.val() || {};
      setMasterSupplier(Object.values(d));
    })
  , []);

  if (loadingAuth) return <p>Checking login...</p>;

  // ======================
  // GENERATE NOMOR BM
  // ======================
  const generateBMNumber = () => {
    const num = data.length + 1;
    return "BM" + num.toString().padStart(4, "0");
  };

  // HANDLE INPUT
  const handleForm = (e) => {
    const { name, value } = e.target;

    let newForm = { ...form, [name]: value };

    if (name === "jumlah" || name === "harga") {
      const qty = Number(name === "jumlah" ? value : form.jumlah) || 0;
      const harga = Number(name === "harga" ? value : form.harga) || 0;
      newForm.total = qty * harga;
    }

    setForm(newForm);
  };

  // APPLY PART
  const applyPart = (p) => {
    setForm({
      ...form,
      partnumber: p.partnumber,
      nama: p.nama,
      harga: p.harga || "",
      total: form.jumlah ? Number(form.jumlah) * Number(p.harga) : "",
    });
    setSearchPart("");
  };

  // APPLY SUPPLIER
  const applySupplier = (s) => {
    setForm({ ...form, supplier: s.nama });
    setSearchSupplier("");
  };

  // ======================
  // SAVE DATA
  // ======================
  const saveData = () => {
    if (!form.partnumber) return alert("Part number wajib!");
    if (!form.supplier) return alert("Supplier wajib!");
    if (!form.jumlah) return alert("Jumlah wajib!");

    const nomorBaru = generateBMNumber();
    const id = push(ref(database, "barangmasuk")).key;

    set(ref(database, "barangmasuk/" + id), {
      id,
      nomor: nomorBaru,
      ...form,
      waktu: form.waktu || today,
      total: Number(form.total || 0),
    });

    alert("Data berhasil disimpan!");

    setForm({
      nomor: "",
      partnumber: "",
      nama: "",
      jumlah: "",
      harga: "",
      total: "",
      supplier: "",
      invoice: "",
      waktu: today,
      ket: "",
    });
  };

  // ======================
  // EXPORT EXCEL
  // ======================
  const exportExcel = () => {
    const rows = data.map((i) => ({
      Nomor: i.nomor,
      "Part Number": i.partnumber,
      Nama: i.nama,
      Jumlah: i.jumlah,
      Harga: i.harga,
      Total: i.total,
      Supplier: i.supplier,
      Invoice: i.invoice,
      Waktu: i.waktu,
      Keterangan: i.ket,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barang Masuk");
    XLSX.writeFile(wb, "barang_masuk.xlsx");
  };

  // ======================
  // IMPORT EXCEL
  // ======================
  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {
      const dataExcel = new Uint8Array(ev.target.result);
      const wb = XLSX.read(dataExcel, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      rows.forEach((r, index) => {
        const id = push(ref(database, "barangmasuk")).key;

        set(ref(database, "barangmasuk/" + id), {
          id,
          nomor: "BM" + (data.length + index + 1).toString().padStart(4, "0"),
          partnumber: r["Part Number"] || "",
          nama: r["Nama"] || "",
          jumlah: r["Jumlah"] || "",
          harga: r["Harga"] || "",
          total: r["Total"] || "",
          supplier: r["Supplier"] || "",
          invoice: r["Invoice"] || "",
          waktu: r["Waktu"] || today,
          ket: r["Keterangan"] || "",
        });
      });

      alert("Import berhasil!");
      e.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  // ======================
  // HAPUS SEMUA
  // ======================
  const clearAll = () => {
    if (!window.confirm("Hapus semua data Barang Masuk?")) return;
    remove(ref(database, "barangmasuk"));
  };

  // ======================
  // FILTER PART
  // ======================
  const filteredPart = masterPart.filter((p) => {
    const pn = String(p.partnumber || "").toLowerCase();
    const nm = String(p.nama || "").toLowerCase();
    const s = searchPart.toLowerCase();
    return pn.includes(s) || nm.includes(s);
  });

  // ======================
  // FILTER SUPPLIER
  // ======================
  const filteredSupplier = masterSupplier.filter((s) =>
    String(s.nama || "").toLowerCase().includes(searchSupplier.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>➕ Barang Masuk (Versi Baru)</h2>

      {/* NAVBAR */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>

        <button onClick={exportExcel}>⬇ Export Excel</button>
        <button onClick={() => fileRef.current.click()}>⬆ Import Excel</button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: "none" }}
          onChange={importExcel}
        />

        <button style={{ background: "red", color: "white" }} onClick={clearAll}>
          🗑 Hapus Semua Data
        </button>

        <button
          style={{ marginLeft: "auto" }}
          onClick={() => {
            signOut(auth);
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      <hr />

      {/* FORM INPUT */}
      <h3>Form Barang Masuk</h3>

      <input
        placeholder="Cari Part Number / Nama"
        value={searchPart}
        onChange={(e) => setSearchPart(e.target.value)}
      />

      {searchPart && (
        <div style={{ border: "1px solid #ccc", width: 300 }}>
          {filteredPart.map((p) => (
            <div
              key={p.id}
              onClick={() => applyPart(p)}
              style={{ padding: 5, cursor: "pointer" }}
            >
              {p.partnumber} — {p.nama}
            </div>
          ))}
        </div>
      )}

      <br />

      <input name="partnumber" value={form.partnumber} placeholder="Part Number" readOnly />
      <input name="nama" value={form.nama} placeholder="Nama" readOnly />

      <input
        name="jumlah"
        placeholder="Jumlah"
        type="number"
        value={form.jumlah}
        onChange={handleForm}
      />

      <input
        name="harga"
        placeholder="Harga"
        type="number"
        value={form.harga}
        onChange={handleForm}
      />

      <input name="total" placeholder="Total" value={form.total} readOnly />

      <br />

      <input
        placeholder="Cari Supplier"
        value={searchSupplier}
        onChange={(e) => setSearchSupplier(e.target.value)}
      />

      {searchSupplier && (
        <div style={{ border: "1px solid #ccc", width: 300 }}>
          {filteredSupplier.map((s) => (
            <div
              key={s.id}
              onClick={() => applySupplier(s)}
              style={{ padding: 5, cursor: "pointer" }}
            >
              {s.nama}
            </div>
          ))}
        </div>
      )}

      <input name="supplier" value={form.supplier} placeholder="Supplier" readOnly />

      <input
        name="invoice"
        placeholder="Invoice"
        value={form.invoice}
        onChange={handleForm}
      />

      <input
        name="waktu"
        type="date"
        value={form.waktu}
        onChange={handleForm}
      />

      <input name="ket" placeholder="Keterangan" value={form.ket} onChange={handleForm} />

      <br />
      <button onClick={saveData}>SIMPAN</button>

      <hr />

      {/* TABEL */}
      <h3>Daftar Barang Masuk</h3>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>No</th>
            <th>Nomor BM</th>
            <th>Part Number</th>
            <th>Nama</th>
            <th>Jumlah</th>
            <th>Harga</th>
            <th>Total</th>
            <th>Supplier</th>
            <th>Invoice</th>
            <th>Waktu</th>
            <th>Keterangan</th>
          </tr>
        </thead>

        <tbody>
          {data.map((i, index) => (
            <tr key={i.id}>
              <td>{index + 1}</td>
              <td>{i.nomor}</td>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.jumlah}</td>
              <td>{i.harga}</td>
              <td>{i.total}</td>
              <td>{i.supplier}</td>
              <td>{i.invoice}</td>
              <td>{i.waktu}</td>
              <td>{i.ket}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
