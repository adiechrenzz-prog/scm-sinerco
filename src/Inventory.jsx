import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set, remove, update } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Inventory() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);

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

  // ======================
  // AUTH GUARD (WAJIB LOGIN)
  // ======================
  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/login"); // ⛔ paksa ke login
      } else {
        setUser(u);
      }
      setLoadingAuth(false);
    });
  }, [navigate]);

  // ======================
  // LOAD DATA
  // ======================
  useEffect(() => {
    const r = ref(database, "items");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setItems(
        Object.values(data).filter(
          (i) => i.partnumber && i.nama
        )
      );
    });
  }, []);

  if (loadingAuth) {
    return <p style={{ padding: 20 }}>Checking login...</p>;
  }

  // ======================
  // HANDLE INPUT
  // ======================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ======================
  // SAVE
  // ======================
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

  const sortedItems = [...items].sort(
    (a, b) => Number(a.partnumber) - Number(b.partnumber)
  );

  return (
    <div style={{ padding: 20 }}>

      <h2>📦 Inventory Management</h2>

      {/* ✅ NAVIGATION BAR */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        
        {/* ✅ TAMBAHAN: BALIK KE DASHBOARD */}
        <button onClick={() => navigate("/dashboard")}>
          🟣 Dashboard
        </button>

        <button onClick={() => navigate("/barang-masuk")}>
          ➕ Barang Masuk
        </button>

        <button onClick={() => navigate("/barang-keluar")}>
          ➖ Barang Keluar
        </button>

        <button onClick={() => navigate("/sisa-stock")}>
          📊 Sisa Stock
        </button>

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

      <h3>{editId ? "Edit Barang" : "Tambah Barang"}</h3>

      <input
        name="partnumber"
        placeholder="Part Number"
        value={form.partnumber}
        onChange={handleChange}
      />
      <input
        name="nama"
        placeholder="Nama Barang"
        value={form.nama}
        onChange={handleChange}
      />
      <input
        name="stok"
        type="number"
        placeholder="Stok"
        value={form.stok}
        onChange={handleChange}
      />
      <input
        name="satuan"
        placeholder="Satuan"
        value={form.satuan}
        onChange={handleChange}
      />
      <input
        name="harga"
        type="number"
        placeholder="Harga"
        value={form.harga}
        onChange={handleChange}
      />
      <input
        name="gudang"
        placeholder="Gudang"
        value={form.gudang}
        onChange={handleChange}
      />
      <input
        name="rack"
        placeholder="Rack"
        value={form.rack}
        onChange={handleChange}
      />

      <br />
      <button onClick={saveItem}>
        {editId ? "Update" : "Simpan"}
      </button>

      <hr />

      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Stok</th>
            <th>Satuan</th>
            <th>Harga</th>
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

    </div>
  );
}
