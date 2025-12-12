import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, push, update, remove } from "firebase/database";

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
    partnumber: "",
    nama: "",
    jumlah: "",
    peminta: "",
    tujuan: "",
    doNumber: "",
    keterangan: "",
    status: "pending",
  });

  const [editId, setEditId] = useState(null);

  /* ======================
      AUTH GUARD
  ====================== */
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  /* ======================
      LOAD INVENTORY
  ====================== */
  useEffect(() => {
    const r = ref(database, "items");
    return onValue(r, (snap) => {
      const d = snap.val() || {};
      setItems(Object.values(d));
    });
  }, []);

  /* ======================
      LOAD HISTORY
  ====================== */
  useEffect(() => {
    const r = ref(database, "barangKeluar");
    return onValue(r, (snap) => {
      const d = snap.val() || {};
      setHistory(Object.values(d));
    });
  }, []);

  if (loadingAuth) return <p>Checking login...</p>;

  /* ======================
      INPUT HANDLER
  ====================== */
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /* ======================
      SAVE DATA BARANG KELUAR
  ====================== */
  const saveData = async () => {
    if (!form.partnumber || !form.jumlah) {
      alert("Part Number & Jumlah wajib diisi!");
      return;
    }

    const jumlahBaru = Number(form.jumlah);

    if (editId) {
      // Ambil data lama untuk menghitung selisih stok
      const lama = history.find((h) => h.id === editId);
      const barang = items.find((i) => i.partnumber === form.partnumber);

      // Jika sudah approved sebelumnya → hitung koreksi stok
      if (barang && lama.status === "approved") {
        const stokBaru =
          Number(barang.stok) + Number(lama.jumlah) - jumlahBaru;

        await update(ref(database, "items/" + barang.id), {
          stok: stokBaru,
        });
      }

      // Update riwayat
      await update(ref(database, "barangKeluar/" + editId), {
        ...form,
        jumlah: jumlahBaru,
      });

      setEditId(null);
    } else {
      // BARU DIBUAT = belum approved → stok belum berubah
      const id = push(ref(database, "barangKeluar")).key;

      await update(ref(database, "barangKeluar/" + id), {
        id,
        ...form,
        jumlah: jumlahBaru,
        waktu: new Date().toLocaleString(),
        status: "pending",
      });
    }

    setForm({
      partnumber: "",
      nama: "",
      jumlah: "",
      peminta: "",
      tujuan: "",
      doNumber: "",
      keterangan: "",
      status: "pending",
    });
  };

  /* ======================
      EDIT
  ====================== */
  const editRow = (row) => {
    setEditId(row.id);
    setForm(row);
  };

  /* ======================
      HAPUS + KOREKSI STOK
  ====================== */
  const deleteRow = async (row) => {
    if (!window.confirm("Hapus permintaan ini?")) return;

    const barang = items.find((i) => i.partnumber === row.partnumber);

    // Jika sudah approved → stok harus dikembalikan
    if (barang && row.status === "approved") {
      const stokBaru = Number(barang.stok) + Number(row.jumlah);

      await update(ref(database, "items/" + barang.id), { stok: stokBaru });
    }

    remove(ref(database, "barangKeluar/" + row.id));
  };

  /* ======================
      EXPORT EXCEL
  ====================== */
  const exportExcel = () => {
    const data = history.map((h) => ({
      "Part Number": h.partnumber,
      "Nama Barang": h.nama,
      Jumlah: h.jumlah,
      "No. DO": h.doNumber,
      Peminta: h.peminta,
      Tujuan: h.tujuan,
      Status: h.status,
      Waktu: h.waktu,
      Keterangan: h.keterangan,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barang Keluar");
    XLSX.writeFile(wb, "barang_keluar.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>➖ Barang Keluar</h2>

      {/* NAVIGATION */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
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

      {/* FORM */}
      <h3>{editId ? "Edit Permintaan Barang Keluar" : "Input Permintaan Barang Keluar"}</h3>

      <select
        name="partnumber"
        value={form.partnumber}
        onChange={(e) => {
          const pn = e.target.value;
          const barang = items.find((i) => i.partnumber === pn);
          setForm({
            ...form,
            partnumber: pn,
            nama: barang?.nama || "",
          });
        }}
      >
        <option value="">Pilih Barang</option>
        {items.map((i) => (
          <option key={i.id} value={i.partnumber}>
            {i.partnumber} — {i.nama}
          </option>
        ))}
      </select>

      <input disabled value={form.nama} placeholder="Nama Barang" />
      <input name="jumlah" placeholder="Jumlah" value={form.jumlah} onChange={onChange} />
      <input name="doNumber" placeholder="No. DO" value={form.doNumber} onChange={onChange} />
      <input name="peminta" placeholder="Peminta" value={form.peminta} onChange={onChange} />
      <input name="tujuan" placeholder="Tujuan" value={form.tujuan} onChange={onChange} />
      <input name="keterangan" placeholder="Keterangan" value={form.keterangan} onChange={onChange} />

      <button onClick={saveData}>{editId ? "Update" : "Simpan"}</button>

      <hr />

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama</th>
            <th>Jumlah</th>
            <th>No. DO</th>
            <th>Peminta</th>
            <th>Tujuan</th>
            <th>Status</th>
            <th>Waktu</th>
            <th>Keterangan</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {history.map((h) => (
            <tr key={h.id}>
              <td>{h.partnumber}</td>
              <td>{h.nama}</td>
              <td>{h.jumlah}</td>
              <td>{h.doNumber}</td>
              <td>{h.peminta}</td>
              <td>{h.tujuan}</td>
              <td>{h.status}</td>
              <td>{h.waktu}</td>
              <td>{h.keterangan}</td>
              <td>
                <button onClick={() => editRow(h)}>Edit</button>
                <button onClick={() => deleteRow(h)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
