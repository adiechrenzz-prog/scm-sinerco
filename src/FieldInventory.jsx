import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function FieldInventory() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    idItem: "",
    qty: "",
    kondisi: "",
    catatan: "",
  });

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
  // LOAD FIELD INVENTORY RECORDS
  // ======================
  useEffect(() => {
    const r = ref(database, "fieldInventory");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setRecords(Object.values(data));
    });
  }, []);

  if (loadingAuth) return <p>Checking login…</p>;

  // ======================
  // INPUT HANDLER
  // ======================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ======================
  // SIMPAN FIELD INVENTORY
  // ======================
  const simpanField = () => {
    if (!form.idItem || !form.qty) {
      alert("Pilih barang dan isi jumlah temuan!");
      return;
    }

    const selected = items.find((x) => x.id === form.idItem);
    if (!selected) return;

    const id = push(ref(database, "fieldInventory")).key;

    set(ref(database, "fieldInventory/" + id), {
      id,
      idItem: selected.id,
      nama: selected.nama,
      partnumber: selected.partnumber,
      qty: Number(form.qty),
      kondisi: form.kondisi,
      catatan: form.catatan,
      waktu: Date.now(),
    });

    alert("✔ Data Field Inventory disimpan!");

    setForm({
      idItem: "",
      qty: "",
      kondisi: "",
      catatan: "",
    });
  };

  // ======================
  // EXPORT EXCEL
  // ======================
  const exportExcel = () => {
    const data = records.map((r) => ({
      "Part Number": r.partnumber,
      "Nama Barang": r.nama,
      "Jumlah Temuan": r.qty,
      "Kondisi": r.kondisi,
      "Catatan": r.catatan,
      "Waktu": new Date(r.waktu).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Field Inventory");
    XLSX.writeFile(wb, "field_inventory.xlsx");
  };

  // ======================
  // FILTER SEARCH
  // ======================
  const filtered = items.filter((i) =>
    (i.nama + i.partnumber).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>🧭 Field Inventory</h2>

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
        <button onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
        <button onClick={() => navigate("/stock-opname")}>📋 Stock Opname</button>

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

      {/* SEARCH BAR */}
      <input
        placeholder="🔍 Cari barang..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 15, padding: 5, width: "200px" }}
      />

      <h3>Input Data Lapangan</h3>

      {/* FORM */}
      <select
        name="idItem"
        value={form.idItem}
        onChange={handleChange}
      >
        <option value="">Pilih Barang</option>
        {filtered.map((i) => (
          <option key={i.id} value={i.id}>
            {i.partnumber} - {i.nama}
          </option>
        ))}
      </select>

      <input
        name="qty"
        type="number"
        placeholder="Jumlah ditemukan"
        value={form.qty}
        onChange={handleChange}
      />

      <input
        name="kondisi"
        placeholder="Kondisi (baik, rusak, hilang...)"
        value={form.kondisi}
        onChange={handleChange}
      />

      <input
        name="catatan"
        placeholder="Catatan tambahan"
        value={form.catatan}
        onChange={handleChange}
      />

      <button onClick={simpanField}>Simpan</button>

      <hr />

      <h3>Riwayat Field Inventory</h3>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Jumlah</th>
            <th>Kondisi</th>
            <th>Catatan</th>
            <th>Waktu</th>
          </tr>
        </thead>

        <tbody>
          {records
            .sort((a, b) => b.waktu - a.waktu)
            .map((r) => (
              <tr key={r.id}>
                <td>{r.partnumber}</td>
                <td>{r.nama}</td>
                <td>{r.qty}</td>
                <td>{r.kondisi}</td>
                <td>{r.catatan}</td>
                <td>{new Date(r.waktu).toLocaleString()}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
