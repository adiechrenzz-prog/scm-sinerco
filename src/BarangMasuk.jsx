import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function BarangMasuk() {
  const navigate = useNavigate();

  const today = new Date().toISOString().substring(0, 10);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);

  const [spareparts, setSpareparts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [searchPart, setSearchPart] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");

  const [form, setForm] = useState({
    partnumber: "",
    nama: "",
    jumlah: "",
    harga: "",
    totalharga: "",
    supplier: "",
    invoice: "",
    waktu: today,
    ket: "",
  });

  const [editId, setEditId] = useState(null);

  // AUTH GUARD
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // LOAD BARANG MASUK
  useEffect(() => {
    const r = ref(database, "barangmasuk");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setItems(Object.values(data));
    });
  }, []);

  // LOAD DATA SPAREPART
  useEffect(() => {
    const r = ref(database, "datasparepart");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setSpareparts(Object.values(data));
    });
  }, []);

  // LOAD DATA SUPPLIER
  useEffect(() => {
    const r = ref(database, "supplier");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setSuppliers(Object.values(data));
    });
  }, []);

  if (loadingAuth) return <p>Checking login…</p>;

  const handleForm = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // APPLY PART (AUTOFILL)
  const applyPart = (sp) => {
    setForm({
      ...form,
      partnumber: sp.partnumber,
      nama: sp.nama,
      harga: sp.harga || "",
      totalharga: form.jumlah ? Number(form.jumlah) * Number(sp.harga) : "",
    });
    setSearchPart("");
  };

  // APPLY SUPPLIER
  const applySupplier = (s) => {
    setForm({ ...form, supplier: s.nama });
    setSearchSupplier("");
  };

  // SAVE BARANG
  const saveItem = () => {
    if (!form.partnumber || !form.nama) return alert("Part Number & Nama wajib!");
    if (!form.supplier) return alert("Supplier wajib!");

    if (editId) {
      update(ref(database, "barangmasuk/" + editId), { ...form });
      setEditId(null);
    } else {
      const id = push(ref(database, "barangmasuk")).key;
      set(ref(database, "barangmasuk/" + id), { id, ...form });
    }

    setForm({
      partnumber: "",
      nama: "",
      jumlah: "",
      harga: "",
      totalharga: "",
      supplier: "",
      invoice: "",
      waktu: today,
      ket: "",
    });
  };

  const editItem = (item) => {
    setEditId(item.id);
    setForm(item);
  };

  const deleteItem = (id) => {
    if (window.confirm("Hapus data ini?")) {
      remove(ref(database, "barangmasuk/" + id));
    }
  };

  // EXPORT EXCEL
  const exportExcel = () => {
    const data = items.map((i) => ({
      "Part Number": i.partnumber,
      "Nama Barang": i.nama,
      Jumlah: i.jumlah,
      Harga: i.harga,
      "Total Harga": i.totalharga,
      Supplier: i.supplier,
      Invoice: i.invoice,
      Waktu: i.waktu,
      Keterangan: i.ket,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barang Masuk");
    XLSX.writeFile(wb, "barang_masuk.xlsx");
  };

  // FILTER LIST PART
  const filteredPart = spareparts.filter(
    (sp) =>
      sp.partnumber.toLowerCase().includes(searchPart.toLowerCase()) ||
      sp.nama.toLowerCase().includes(searchPart.toLowerCase())
  );

  // FILTER LIST SUPPLIER
  const filteredSupplier = suppliers.filter((s) =>
    s.nama.toLowerCase().includes(searchSupplier.toLowerCase())
  );

  // TOTAL PEMBELIAN
  const totalPembelian = items.reduce(
    (sum, i) => sum + Number(i.totalharga || 0),
    0
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>➕ Barang Masuk</h2>

      {/* NAVIGATION */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/approval-barang-keluar")}>📝 Approval</button>
        <button onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
        <button onClick={() => navigate("/stock-opname")}>📋 Stock Opname</button>
        <button onClick={() => navigate("/field-inventory")}>🧭 Field Inventory</button>

        <button onClick={() => navigate("/data-part")}>🛠 Sparepart</button>
        <button onClick={() => navigate("/supplier")}>🏬 Supplier</button>
        <button onClick={() => navigate("/peminta")}>👤 Peminta</button>
        <button onClick={() => navigate("/tujuan")}>🎯 Tujuan</button>

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
      <h3>{editId ? "Edit Barang Masuk" : "Tambah Barang Masuk"}</h3>

      {/* SEARCH PART */}
      <input
        placeholder="Cari Part Number / Nama Barang"
        value={searchPart}
        onChange={(e) => setSearchPart(e.target.value)}
      />

      {searchPart && (
        <div style={{ border: "1px solid #aaa", width: 300, background: "#f0f0f0" }}>
          {filteredPart.map((sp) => (
            <div
              key={sp.id}
              onClick={() => applyPart(sp)}
              style={{ padding: 5, cursor: "pointer", borderBottom: "1px solid #ddd" }}
            >
              <b>{sp.partnumber}</b> — {sp.nama}
            </div>
          ))}
        </div>
      )}

      {/* SEARCH SUPPLIER */}
      <input
        placeholder="Cari Supplier"
        value={searchSupplier}
        onChange={(e) => setSearchSupplier(e.target.value)}
      />

      {searchSupplier && (
        <div style={{ border: "1px solid #aaa", width: 300, background: "#f7f7f7" }}>
          {filteredSupplier.map((s) => (
            <div
              key={s.id}
              onClick={() => applySupplier(s)}
              style={{ padding: 5, cursor: "pointer", borderBottom: "1px solid #ddd" }}
            >
              {s.nama}
            </div>
          ))}
        </div>
      )}

      <br />

      {/* MAIN INPUTS */}
      <input name="partnumber" placeholder="Part Number" value={form.partnumber} onChange={handleForm} />
      <input name="nama" placeholder="Nama Barang" value={form.nama} onChange={handleForm} />

      {/* JUMLAH FIXED VERSION */}
      <input
        name="jumlah"
        type="number"
        placeholder="Jumlah"
        value={form.jumlah}
        onChange={(e) => {
          const jumlahBaru = e.target.value;
          const jumlahNum = Number(jumlahBaru || 0);
          const hargaNum = Number(form.harga || 0);

          setForm({
            ...form,
            jumlah: jumlahBaru,
            totalharga: jumlahNum * hargaNum,
          });
        }}
      />

      <input name="harga" type="number" placeholder="Harga Satuan" value={form.harga} onChange={handleForm} />

      <input
        name="totalharga"
        type="number"
        placeholder="Total Harga"
        value={form.totalharga}
        readOnly
      />

      <input name="supplier" placeholder="Supplier" value={form.supplier} onChange={handleForm} />
      <input name="invoice" placeholder="Invoice" value={form.invoice} onChange={handleForm} />
      <input type="date" name="waktu" value={form.waktu} onChange={handleForm} />
      <input name="ket" placeholder="Keterangan" value={form.ket} onChange={handleForm} />

      <br />
      <button onClick={saveItem}>{editId ? "Update" : "Simpan"}</button>

      <hr />

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Jumlah</th>
            <th>Harga Satuan</th>
            <th>Total Harga</th>
            <th>Supplier</th>
            <th>Invoice</th>
            <th>Waktu</th>
            <th>Keterangan</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.jumlah}</td>
              <td>{i.harga}</td>
              <td>{i.totalharga}</td>
              <td>{i.supplier}</td>
              <td>{i.invoice}</td>
              <td>{i.waktu}</td>
              <td>{i.ket}</td>

              <td>
                <button onClick={() => editItem(i)}>Edit</button>
                <button onClick={() => deleteItem(i.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>💰 Total Pembelian: Rp {totalPembelian.toLocaleString()}</h3>
    </div>
  );
}
