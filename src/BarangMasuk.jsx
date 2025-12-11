import { useEffect, useState, useRef } from "react";
import { database } from "./firebase";
import {
  ref,
  onValue,
  push,
  set,
  update
} from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function BarangMasuk() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);

  const [form, setForm] = useState({
    idItem: "",
    jumlah: "",
    keterangan: "",
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
  // LOAD ITEM INVENTORY
  // ======================
  useEffect(() => {
    const r = ref(database, "items");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setItems(Object.values(data));
    });
  }, []);

  // ======================
  // LOAD HISTORY BARANG MASUK
  // ======================
  useEffect(() => {
    const r = ref(database, "barangMasuk");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setHistory(Object.values(data));
    });
  }, []);

  if (loadingAuth) return <p>Checking login…</p>;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ======================
  // SIMPAN BARANG MASUK
  // ======================
  const simpanBarangMasuk = () => {
    if (!form.idItem || !form.jumlah) {
      alert("Pilih item & isi jumlah!");
      return;
    }

    const selected = items.find((x) => x.id === form.idItem);
    if (!selected) return;

    const newStok = Number(selected.stok) + Number(form.jumlah);

    // UPDATE STOK INVENTORY
    update(ref(database, "items/" + selected.id), {
      stok: newStok,
    });

    // SIMPAN HISTORY
    const id = push(ref(database, "barangMasuk")).key;
    set(ref(database, "barangMasuk/" + id), {
      id,
      idItem: selected.id,
      nama: selected.nama,
      jumlah: Number(form.jumlah),
      waktu: Date.now(),
      keterangan: form.keterangan || "",
    });

    alert("✔ Barang Masuk disimpan");

    setForm({
      idItem: "",
      jumlah: "",
      keterangan: "",
    });
  };

  // ======================
  // EXPORT HISTORY KE EXCEL
  // ======================
  const exportExcel = () => {
    const data = history.map((h) => ({
      "Nama Barang": h.nama,
      "Jumlah Masuk": h.jumlah,
      "Waktu": new Date(h.waktu).toLocaleString(),
      "Keterangan": h.keterangan,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barang Masuk");
    XLSX.writeFile(wb, "barang_masuk.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>➕ Barang Masuk</h2>

      {/* NAVIGATION BAR */}
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
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/approval-barang-keluar")}>📝 Approval</button>
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

      {/* FORM INPUT */}
      <h3>Input Barang Masuk</h3>

      <select
        name="idItem"
        value={form.idItem}
        onChange={handleChange}
      >
        <option value="">Pilih Barang</option>
        {items.map((i) => (
          <option key={i.id} value={i.id}>
            {i.partnumber} - {i.nama}
          </option>
        ))}
      </select>

      <input
        name="jumlah"
        type="number"
        placeholder="Jumlah Masuk"
        value={form.jumlah}
        onChange={handleChange}
      />

      <input
        name="keterangan"
        placeholder="Keterangan"
        value={form.keterangan}
        onChange={handleChange}
      />

      <button onClick={simpanBarangMasuk}>Simpan</button>

      <hr />

      {/* TABEL HISTORY */}
      <h3>Riwayat Barang Masuk</h3>

      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>Nama Barang</th>
            <th>Jumlah</th>
            <th>Waktu</th>
            <th>Keterangan</th>
          </tr>
        </thead>

        <tbody>
          {history
            .sort((a, b) => b.waktu - a.waktu)
            .map((h) => (
              <tr key={h.id}>
                <td>{h.nama}</td>
                <td>{h.jumlah}</td>
                <td>{new Date(h.waktu).toLocaleString()}</td>
                <td>{h.keterangan}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
