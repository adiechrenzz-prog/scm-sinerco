import { useState, useEffect } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function StockOpname() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);

  const [datasparepart, setDatasparepart] = useState([]);
  const [barangMasuk, setBarangMasuk] = useState([]);
  const [barangKeluar, setBarangKeluar] = useState([]);
  const [opname, setOpname] = useState([]);

  const [searchPart, setSearchPart] = useState("");

  const [form, setForm] = useState({
    id: "",
    partnumber: "",
    nama: "",
    stokSistem: "",
    stokFisik: "",
    selisih: "",
    waktu: "",
  });

  const [editId, setEditId] = useState(null);

  // ========= AUTO DATETIME =========
  const nowIsoDateTime = () => {
    const d = new Date();
    const date = d.toISOString().substring(0, 10);
    const time = d.toTimeString().split(" ")[0];
    return `${date} ${time}`;
  };

  // ========= AUTH GUARD =========
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // ========= LOAD MASTER SPAREPART =========
  useEffect(() => {
    const r = ref(database, "datasparepart");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setDatasparepart(Object.values(data));
    });
  }, []);

  // ========= LOAD BARANG MASUK =========
  useEffect(() => {
    const r = ref(database, "barangmasuk");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setBarangMasuk(Object.values(data));
    });
  }, []);

  // ========= LOAD BARANG KELUAR (APPROVED) =========
  useEffect(() => {
    const r = ref(database, "barangkeluar");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setBarangKeluar(
        Object.values(data).filter((i) => i.status === "approved")
      );
    });
  }, []);

  // ========= LOAD OPNAME =========
  useEffect(() => {
    const r = ref(database, "stockopname");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setOpname(Object.values(data));
    });
  }, []);

  if (loadingAuth) return <p>Checking login...</p>;

  // ========= HITUNG STOK SISTEM =========
  const getStockSystem = (partnumber) => {
    const awal = 0;

    const masuk = barangMasuk
      .filter((i) => i.partnumber === partnumber)
      .reduce((t, a) => t + Number(a.jumlah || 0), 0);

    const keluar = barangKeluar
      .filter((i) => i.partnumber === partnumber)
      .reduce((t, a) => t + Number(a.jumlah || 0), 0);

    return awal + masuk - keluar;
  };

  // ========= SAAT INPUT MANUAL PARTNUMBER =========
  const onPartNumberInput = (e) => {
    const val = e.target.value;

    const found = datasparepart.find(
      (d) =>
        d.partnumber &&
        d.partnumber.toString().toLowerCase() === val.toLowerCase()
    );

    if (found) {
      const stokSistem = getStockSystem(found.partnumber);

      setForm({
        ...form,
        partnumber: found.partnumber,
        nama: found.nama,
        stokSistem,
        stokFisik: "",
        selisih: "",
        waktu: nowIsoDateTime(),
      });
    } else {
      setForm({
        ...form,
        partnumber: val,
        nama: "",
        stokSistem: "",
        stokFisik: "",
        selisih: "",
        waktu: nowIsoDateTime(),
      });
    }
  };

  // ========= SAAT PILIH DARI SEARCH =========
  const applyPart = (sp) => {
    const stokSistem = getStockSystem(sp.partnumber);

    setForm({
      ...form,
      partnumber: sp.partnumber,
      nama: sp.nama,
      stokSistem,
      stokFisik: "",
      selisih: "",
      waktu: nowIsoDateTime(),
    });

    setSearchPart("");
  };

  // ========= HANDLE INPUT FORM =========
  const onChangeForm = (e) => {
    const { name, value } = e.target;

    let newForm = { ...form, [name]: value };

    if (name === "stokFisik") {
      const fisik = Number(value) || 0;
      const sistem = Number(form.stokSistem) || 0;
      newForm.selisih = fisik - sistem;
    }

    setForm(newForm);
  };

  // ========= SAVE =========
  const saveOpname = () => {
    if (!form.partnumber) return alert("Part Number wajib!");
    if (!form.stokFisik) return alert("Masukkan stok fisik!");

    if (editId) {
      update(ref(database, "stockopname/" + editId), form);
      setEditId(null);
    } else {
      const id = push(ref(database, "stockopname")).key;
      set(ref(database, "stockopname/" + id), { ...form, id });
    }

    setForm({
      id: "",
      partnumber: "",
      nama: "",
      stokSistem: "",
      stokFisik: "",
      selisih: "",
      waktu: "",
    });
  };

  // ========= EDIT =========
  const doEdit = (item) => {
    setEditId(item.id);
    setForm(item);
  };

  // ========= HAPUS =========
  const doDelete = (id) => {
    if (window.confirm("Hapus data ini?")) {
      remove(ref(database, "stockopname/" + id));
    }
  };

  // ========= FILTER SEARCH =========
  const filteredParts = datasparepart.filter(
    (sp) =>
      sp.partnumber.toLowerCase().includes(searchPart.toLowerCase()) ||
      sp.nama.toLowerCase().includes(searchPart.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Stock Opname</h2>

      {/* NAVIGATION */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/approval-barang-keluar")}>📝 Approval</button>
        <button onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
        <button onClick={() => navigate("/field-inventory")}>🧭 Field Inventory</button>

        <button onClick={() => navigate("/data-part")}>🛠 Sparepart</button>

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

      {/* ===== INPUT STOCK OPNAME ===== */}
      <h3>Input Stok Fisik</h3>

      <input
        placeholder="Cari Part Number / Nama Barang"
        value={searchPart}
        onChange={(e) => setSearchPart(e.target.value)}
        style={{ width: 300 }}
      />

      {searchPart && (
        <div
          style={{
            border: "1px solid #aaa",
            width: 300,
            background: "#f9f9f9",
            padding: 5,
          }}
        >
          {filteredParts.map((sp) => (
            <div
              key={sp.id}
              style={{
                padding: 5,
                cursor: "pointer",
                borderBottom: "1px solid #ddd",
              }}
              onClick={() => applyPart(sp)}
            >
              <b>{sp.partnumber}</b> — {sp.nama}
            </div>
          ))}
        </div>
      )}

      <br />

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Stok Sistem</th>
            <th>Stok Fisik</th>
            <th>Selisih</th>
            <th>Waktu</th>
            <th>Simpan</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <input
                name="partnumber"
                value={form.partnumber}
                onChange={onPartNumberInput}
                style={{ width: "100%" }}
              />
            </td>
            <td>
              <input name="nama" value={form.nama} readOnly />
            </td>
            <td>
              <input name="stokSistem" value={form.stokSistem} readOnly />
            </td>
            <td>
              <input
                name="stokFisik"
                type="number"
                value={form.stokFisik}
                onChange={onChangeForm}
              />
            </td>
            <td>
              <input name="selisih" value={form.selisih} readOnly />
            </td>

            <td>
              <input name="waktu" value={form.waktu} readOnly />
            </td>

            <td>
              <button onClick={saveOpname}>{editId ? "Update" : "Simpan"}</button>
            </td>
          </tr>
        </tbody>
      </table>

      <hr />

      {/* ===== RIWAYAT ===== */}
      <h3>Riwayat Stock Opname</h3>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Stok Sistem</th>
            <th>Stok Fisik</th>
            <th>Selisih</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {opname.map((i) => (
            <tr key={i.id}>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.stokSistem}</td>
              <td>{i.stokFisik}</td>
              <td>{i.selisih}</td>
              <td>{i.waktu}</td>

              <td>
                <button onClick={() => doEdit(i)}>Edit</button>
                <button onClick={() => doDelete(i.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
