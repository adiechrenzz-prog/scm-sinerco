import { useEffect, useState, useRef } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set, remove, update } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function Inventory() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);

  const [spareparts, setSpareparts] = useState([]); // master sparepart
  const [searchText, setSearchText] = useState("");

  const [form, setForm] = useState({
    partnumber: "",
    nama: "",
    stok: "",
    satuan: "",
    harga: "",
    gudang: "",
    rack: "",
  });

  const [editId, setEditId] = useState(null);

  // ====================================
  // AUTH GUARD
  // ====================================
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // ====================================
  // LOAD INVENTORY
  // ====================================
  useEffect(() => {
    const r = ref(database, "items");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setItems(Object.values(data));
    });
  }, []);

  // ====================================
  // LOAD MASTER SPAREPART
  // ====================================
  useEffect(() => {
    const r = ref(database, "datasparepart");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setSpareparts(Object.values(data));
    });
  }, []);

  if (loadingAuth) return <p>Checking login...</p>;

  // ====================================
  // HANDLE INPUT FORM
  // ====================================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ====================================
  // APPLY MASTER SPAREPART (AUTO HARGA)
  // ====================================
  const applySparepart = (sp) => {
    setForm({
      ...form,
      partnumber: sp.partnumber,
      nama: sp.nama,
      harga: sp.harga || 0, // 🌟 ambil harga otomatis
    });
    setSearchText("");
  };

  // ====================================
  // SAVE ITEM
  // ====================================
  const saveItem = () => {
    if (!form.partnumber || !form.nama) {
      alert("Part Number & Nama wajib");
      return;
    }

    if (editId) {
      update(ref(database, "items/" + editId), {
        ...form,
        stok: Number(form.stok) || 0,
        harga: Number(form.harga) || 0,
      });
      setEditId(null);
    } else {
      const id = push(ref(database, "items")).key;
      set(ref(database, "items/" + id), {
        id,
        ...form,
        stok: Number(form.stok) || 0,
        harga: Number(form.harga) || 0,
      });
    }

    setForm({
      partnumber: "",
      nama: "",
      stok: "",
      satuan: "",
      harga: "",
      gudang: "",
      rack: "",
    });
  };

  const deleteItem = (id) => {
    if (window.confirm("Hapus data?")) {
      remove(ref(database, "items/" + id));
    }
  };

  const editItem = (i) => {
    setEditId(i.id);
    setForm(i);
  };

  // ====================================
  // EXPORT EXCEL
  // ====================================
  const exportExcel = () => {
    const data = items.map((i) => ({
      "Part Number": i.partnumber,
      "Nama Barang": i.nama,
      Stok: i.stok,
      Satuan: i.satuan,
      Harga: i.harga,
      "Total Harga": i.stok * i.harga,
      Gudang: i.gudang,
      Rack: i.rack,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory.xlsx");
  };

  // ====================================
  // IMPORT EXCEL
  // ====================================
  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

        rows.forEach((row) => {
          const pn = (row["Part Number"] || "").toString().trim();
          const nama = (row["Nama Barang"] || "").toString().trim();

          if (!pn || !nama) return;

          const id = push(ref(database, "items")).key;

          set(ref(database, "items/" + id), {
            id,
            partnumber: pn,
            nama,
            stok: Number(row["Stok"]) || 0,
            satuan: row["Satuan"] || "",
            harga: Number(row["Harga"]) || 0,
            gudang: row["Gudang"] || "",
            rack: row["Rack"] || "",
          });
        });

        alert("Import berhasil!");
        e.target.value = "";
      } catch (err) {
        console.error(err);
        alert("File Excel rusak!");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // ====================================
  // FILTER SPAREPART SEARCH
  // ====================================
  const filteredSpareparts = spareparts.filter(
    (s) =>
      s.partnumber.toLowerCase().includes(searchText.toLowerCase()) ||
      s.nama.toLowerCase().includes(searchText.toLowerCase())
  );

  const sortedItems = [...items].sort(
    (a, b) => Number(a.partnumber) - Number(b.partnumber)
  );

  // ====================================
  // TOTAL SUM HARGA
  // ====================================
  const totalSum = sortedItems.reduce(
    (acc, item) => acc + Number(item.stok) * Number(item.harga),
    0
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Inventory</h2>

      {/* NAV BAR */}
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

        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/approval-barang-keluar")}>📝 Approval</button>
        <button onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
        <button onClick={() => navigate("/stock-opname")}>📋 Stock Opname</button>
        <button onClick={() => navigate("/field-inventory")}>🧭 Field Inventory</button>

        <button onClick={() => navigate("/data-part")}>🛠 Sparepart</button>
        <button onClick={() => navigate("/supplier")}>🏬 Supplier</button>
        <button onClick={() => navigate("/peminta")}>👤 Peminta</button>
        <button onClick={() => navigate("/tujuan")}>🎯 Tujuan</button>

        <button onClick={() => fileInputRef.current.click()}>⬆ Import Excel</button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={importExcel} />

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

      {/* SEARCH SPAREPART */}
      <h3>Cari Sparepart</h3>
      <input
        placeholder="Search Part Number / Nama Barang"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: "40%", marginBottom: 10 }}
      />

      {searchText && (
        <div style={{ border: "1px solid #aaa", padding: 10, width: "40%", background: "#f7f7f7" }}>
          {filteredSpareparts.length === 0 && <p>Tidak ditemukan...</p>}

          {filteredSpareparts.map((sp) => (
            <div
              key={sp.id}
              onClick={() => applySparepart(sp)}
              style={{
                padding: 5,
                cursor: "pointer",
                borderBottom: "1px solid #ddd",
              }}
            >
              <b>{sp.partnumber}</b> — {sp.nama} — Rp {sp.harga}
            </div>
          ))}
        </div>
      )}

      <hr />

      {/* FORM INPUT */}
      <h3>{editId ? "Edit Barang" : "Tambah Barang"}</h3>

      <input name="partnumber" placeholder="Part Number" value={form.partnumber} onChange={handleChange} />
      <input name="nama" placeholder="Nama Barang" value={form.nama} onChange={handleChange} />
      <input name="stok" type="number" placeholder="Stok" value={form.stok} onChange={handleChange} />
      <input name="satuan" placeholder="Satuan" value={form.satuan} onChange={handleChange} />
      <input name="harga" type="number" placeholder="Harga Satuan" value={form.harga} onChange={handleChange} />
      <input name="gudang" placeholder="Gudang" value={form.gudang} onChange={handleChange} />
      <input name="rack" placeholder="Rack" value={form.rack} onChange={handleChange} />

      <br />
      <button onClick={saveItem}>{editId ? "Update" : "Simpan"}</button>

      <hr />

      {/* TABLE */}
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
          {sortedItems.map((i) => (
            <tr key={i.id}>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.stok}</td>
              <td>{i.satuan}</td>
              <td>{i.harga}</td>
              <td>{Number(i.stok) * Number(i.harga)}</td>
              <td>{i.gudang}</td>
              <td>{i.rack}</td>

              <td>
                <button onClick={() => editItem(i)}>Edit</button>
                <button onClick={() => deleteItem(i.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 20 }}>
        💰 TOTAL SEMUA BARANG: <b>Rp {totalSum.toLocaleString()}</b>
      </h3>
    </div>
  );
}
