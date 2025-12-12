// src/OilUsage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import * as XLSX from "xlsx";

export default function OilUsage() {
  const navigate = useNavigate();

  const today = new Date().toISOString().substring(0, 10);

  const [loading, setLoading] = useState(true);

  const [usage, setUsage] = useState([]);
  const [locations, setLocations] = useState([]);
  const [priceList, setPriceList] = useState([]);

  const [search, setSearch] = useState("");

  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    id: "",
    tanggal: today,
    lokasi: "",
    jenis: "",
    qty: "",
    harga: "",
    total: "",
    ket: "",
  });

  // =============================
  // LOAD DATABASE
  // =============================
  useEffect(() => {
    // pemakaian oli
    const r1 = ref(database, "oilUsage");
    const unsub1 = onValue(r1, (snap) => {
      const val = snap.val() || {};
      setUsage(Object.values(val));
    });

    // lokasi oli
    const r2 = ref(database, "oilLocation");
    const unsub2 = onValue(r2, (snap) => {
      const val = snap.val() || {};
      setLocations(Object.values(val));
    });

    // harga oli
    const r3 = ref(database, "oilPrice");
    const unsub3 = onValue(r3, (snap) => {
      const val = snap.val() || {};
      setPriceList(Object.values(val));
      setLoading(false);
    });

    // cleanup
    return () => {
      try { unsub1(); } catch (e) {}
      try { unsub2(); } catch (e) {}
      try { unsub3(); } catch (e) {}
    };
  }, []);

  if (loading) return <p>Loading...</p>;

  // =============================
  // HANDLE FORM
  // =============================
  const handleChange = (e) => {
    let { name, value } = e.target;

    // jika qty berubah → hitung total
    if (name === "qty") {
      const total = (Number(value) || 0) * (Number(form.harga) || 0);
      setForm({ ...form, qty: value, total });
      return;
    }

    // jika harga berubah → hitung total
    if (name === "harga") {
      const total = (Number(form.qty) || 0) * (Number(value) || 0);
      setForm({ ...form, harga: value, total });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  // pilih jenis oli -> otomatis ambil harga dari priceList
  const selectJenisOli = (jenis) => {
    const data = priceList.find((p) => (p.nama || p.name) === jenis || (p.id || "") === jenis);
    const harga = data ? Number(data.harga || data.price || 0) : 0;

    const total = (Number(form.qty) || 0) * harga;

    setForm({
      ...form,
      jenis,
      harga,
      total,
    });
  };

  // =============================
  // SAVE
  // =============================
  const saveData = () => {
    if (!form.tanggal || !form.lokasi || !form.jenis)
      return alert("Tanggal, Lokasi, dan Jenis Oli wajib diisi");

    const id = form.id || push(ref(database, "oilUsage")).key;
    const payload = {
      ...form,
      id,
      qty: Number(form.qty) || 0,
      harga: Number(form.harga) || 0,
      total: Number(form.total) || 0,
    };

    set(ref(database, "oilUsage/" + id), payload);

    resetForm();
  };

  const editData = (item) => {
    // safe defaults
    setForm({
      id: item.id || "",
      tanggal: item.tanggal || today,
      lokasi: item.lokasi || "",
      jenis: item.jenis || "",
      qty: item.qty || "",
      harga: item.harga || "",
      total: item.total || "",
      ket: item.ket || "",
    });
    setEditMode(true);
  };

  const deleteData = (id) => {
    if (window.confirm("Hapus data pemakaian ini?")) {
      remove(ref(database, "oilUsage/" + id));
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      tanggal: today,
      lokasi: "",
      jenis: "",
      qty: "",
      harga: "",
      total: "",
      ket: "",
    });
    setEditMode(false);
  };

  // =============================
  // FILTER
  // =============================
  const filtered = usage.filter(
    (u) =>
      (u.tanggal || "").includes(search) ||
      (u.lokasi || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.jenis || "").toLowerCase().includes(search.toLowerCase())
  );

  // =============================
  // EXPORT EXCEL
  // =============================
  const exportExcel = () => {
    const rows = filtered.map((u) => ({
      Tanggal: u.tanggal,
      Lokasi: u.lokasi,
      "Jenis Oli": u.jenis,
      Qty: u.qty,
      Harga: u.harga,
      Total: u.total,
      Keterangan: u.ket,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "OilUsage");
    XLSX.writeFile(wb, "oil_usage.xlsx");
  };

  // =============================
  // EXPORT PDF (simple)
  // =============================
  const exportPDF = () => {
    const rows = filtered
      .map(
        (u) =>
          `${u.tanggal} | ${u.lokasi} | ${u.jenis} | ${u.qty} | ${u.harga} | ${u.total} | ${u.ket}`
      )
      .join("\n");

    const blob = new Blob([rows], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oil_usage.pdf";
    a.click();
  };

  // =============================
  // RENDER
  // =============================
  return (
    <div style={{ padding: 20 }}>
      <h2>🛢 Oil Usage</h2>

      {/* NAVIGATION */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>

        <button onClick={() => navigate("/oil-location")}>📍 Oil Location</button>
        <button onClick={() => navigate("/oil-price")}>💰 Oil Price</button>
        <button onClick={() => navigate("/oil-monthly-recap")}>📊 Monthly Recap</button>
        <button onClick={() => navigate("/oil-analysis")}>📈 Oil Analysis</button>

        <button onClick={exportExcel}>⬇ Export Excel</button>
        <button onClick={exportPDF}>🖨 Export PDF</button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Cari tanggal / lokasi / jenis oli..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "40%", marginBottom: 10 }}
      />

      <hr />

      {/* FORM */}
      <h3>{editMode ? "✏ Edit Pemakaian Oli" : "➕ Tambah Pemakaian Oli"}</h3>

      <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} />

      {/* Lokasi */}
      <select name="lokasi" value={form.lokasi} onChange={handleChange}>
        <option value="">Pilih Lokasi</option>
        {locations.map((l) => (
          <option key={l.id || l.nama || l.name} value={l.nama || l.name}>
            {l.nama || l.name}
          </option>
        ))}
      </select>

      {/* Jenis Oli */}
      <select
        name="jenis"
        value={form.jenis}
        onChange={(e) => selectJenisOli(e.target.value)}
      >
        <option value="">Pilih Jenis Oli</option>
        {priceList.map((p) => (
          <option key={p.id || p.nama || p.name} value={p.nama || p.name}>
            {p.nama || p.name}
          </option>
        ))}
      </select>

      <input
        name="qty"
        type="number"
        placeholder="Qty (Liter)"
        value={form.qty}
        onChange={handleChange}
      />

      <input
        name="harga"
        type="number"
        placeholder="Harga per Liter"
        value={form.harga}
        readOnly
      />

      <input
        name="total"
        type="number"
        placeholder="Total Harga"
        value={form.total}
        readOnly
      />

      <input
        name="ket"
        placeholder="Keterangan"
        value={form.ket}
        onChange={handleChange}
      />

      <br />
      <button onClick={saveData}>{editMode ? "Update" : "Simpan"}</button>
      {editMode && <button onClick={resetForm}>Batal</button>}

      <hr />

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Lokasi</th>
            <th>Jenis Oli</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Total</th>
            <th>Keterangan</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((u) => (
            <tr key={u.id}>
              <td>{u.tanggal}</td>
              <td>{u.lokasi}</td>
              <td>{u.jenis}</td>
              <td>{u.qty}</td>
              <td>{u.harga}</td>
              <td>{u.total}</td>
              <td>{u.ket}</td>

              <td>
                <button onClick={() => editData(u)}>Edit</button>{" "}
                <button onClick={() => deleteData(u.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 10 }}>✔ Data tersimpan di Firebase</p>
    </div>
  );
}
