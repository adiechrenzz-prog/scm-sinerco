import { useState, useEffect } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set, remove, update } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function DataPart() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    partnumber: "",
    nama: "",
    harga: "",       // 🔥 Tambahan harga satuan
  });

  const [editId, setEditId] = useState(null);

  // AUTH
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // LOAD DB
  useEffect(() => {
    const r = ref(database, "datasparepart");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setItems(Object.values(data));
    });
  }, []);

  if (loadingAuth) return <p>Checking login...</p>;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveItem = () => {
    if (!form.partnumber || !form.nama) {
      alert("Part Number & Nama wajib!");
      return;
    }

    if (editId) {
      update(ref(database, "datasparepart/" + editId), { ...form });
      setEditId(null);
    } else {
      const id = push(ref(database, "datasparepart")).key;
      set(ref(database, "datasparepart/" + id), {
        id,
        ...form,
      });
    }

    setForm({ partnumber: "", nama: "", harga: "" });
  };

  const deleteItem = (id) => {
    if (window.confirm("Hapus sparepart ini?")) {
      remove(ref(database, "datasparepart/" + id));
    }
  };

  const editItem = (item) => {
    setEditId(item.id);
    setForm(item);
  };

  const sorted = [...items].sort(
    (a, b) => Number(a.partnumber) - Number(b.partnumber)
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>🛠 Master Data Sparepart</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
        <button onClick={() => navigate("/stock-opname")}>📋 Stock Opname</button>

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

      <h3>{editId ? "Edit Sparepart" : "Tambah Sparepart"}</h3>

      <input
        name="partnumber"
        placeholder="Part Number"
        value={form.partnumber}
        onChange={handleChange}
      />

      <input
        name="nama"
        placeholder="Nama Sparepart"
        value={form.nama}
        onChange={handleChange}
      />

      <input
        name="harga"
        type="number"
        placeholder="Harga Satuan"
        value={form.harga}
        onChange={handleChange}
      />

      <br />
      <button onClick={saveItem}>{editId ? "Update" : "Simpan"}</button>

      <hr />

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Sparepart</th>
            <th>Harga Satuan</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((i) => (
            <tr key={i.id}>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.harga || "-"}</td>

              <td>
                <button onClick={() => editItem(i)}>Edit</button>
                <button onClick={() => deleteItem(i.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
