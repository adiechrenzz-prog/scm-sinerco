import { useEffect, useState } from "react";
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

export default function BarangKeluar() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);

  const [form, setForm] = useState({
    idItem: "",
    jumlah: "",
    tujuan: "",
    peminta: "",
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
  // LOAD HISTORY BARANG KELUAR
  // ======================
  useEffect(() => {
    const r = ref(database, "barangKeluar");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setHistory(Object.values(data));
    });
  }, []);

  if (loadingAuth) return <p>Checking login…</p>;

  // INPUT HANDLER
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ======================
  // SIMPAN BARANG KELUAR
  // ======================
  const simpanBarangKeluar = () => {
    if (!form.idItem || !form.jumlah || !form.peminta) {
      alert("Isi item, jumlah, & peminta!");
      return;
    }

    const selected = items.find((x) => x.id === form.idItem);
    if (!selected) {
      alert("Item tidak ditemukan!");
      return;
    }

    const jumlah = Number(form.jumlah);

    if (jumlah <= 0) {
      alert("Jumlah harus lebih dari 0");
      return;
    }

    if (selected.stok < jumlah) {
      alert("❌ Stok tidak cukup!");
      return;
    }

    const newStok = selected.stok - jumlah;

    // Kurangi stok inventory
    update(ref(database, "items/" + selected.id), {
      stok: newStok,
    });

    // Simpan ke history
    const id = push(ref(database, "barangKeluar")).key;
    set(ref(database, "barangKeluar/" + id), {
      id,
      idItem: selected.id,
      nama: selected.nama,
      jumlah: jumlah,
      tujuan: form.tujuan || "",
      peminta: form.peminta,
      keterangan: form.keterangan || "",
      waktu: Date.now(),
    });

    alert("✔ Barang Keluar berhasil disimpan");

    setForm({
      idItem: "",
      jumlah: "",
      tujuan: "",
      peminta: "",
      keterangan: "",
    });
  };

  // ======================
  // EXPORT HISTORY
  // ======================
  const exportExcel = () => {
    const data = history.map((h) => ({
      "Nama Barang": h.nama,
      "Jumlah Keluar": h.jumlah,
      "Tujuan": h.tujuan,
      "Peminta": h.peminta,
      "Waktu": new Date(h.waktu).toLocaleString(),
      "Keterangan": h.keterangan,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barang Keluar");
    XLSX.writeFile(wb, "barang_keluar.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>➖ Barang Keluar</h2>

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
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
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
      <h3>Input Barang Keluar</h3>

      <select
        name="idItem"
        value={form.idItem}
        onChange={handleChange}
      >
        <option value="">Pilih Barang</option>
        {items.map((i) => (
          <option key={i.id} value={i.id}>
            {i.partnumber} - {i.nama} (stok: {i.stok})
          </option>
        ))}
      </select>

      <input
        name="jumlah"
        type="number"
        placeholder="Jumlah Keluar"
        value={form.jumlah}
        onChange={handleChange}
      />

      <input
        name="peminta"
        placeholder="Peminta"
        value={form.peminta}
        onChange={handleChange}
      />

      <input
        name="tujuan"
        placeholder="Tujuan"
        value={form.tujuan}
        onChange={handleChange}
      />

      <input
        name="keterangan"
        placeholder="Keterangan"
        value={form.keterangan}
        onChange={handleChange}
      />

      <button onClick={simpanBarangKeluar}>Simpan</button>

      <hr />

      {/* TABEL HISTORY */}
      <h3>Riwayat Barang Keluar</h3>

      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>Nama Barang</th>
            <th>Jumlah</th>
            <th>Peminta</th>
            <th>Tujuan</th>
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
                <td>{h.peminta}</td>
                <td>{h.tujuan}</td>
                <td>{new Date(h.waktu).toLocaleString()}</td>
                <td>{h.keterangan}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
