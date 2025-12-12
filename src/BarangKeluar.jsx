import { useState, useEffect } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function BarangKeluar() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);

  const [datapart, setDatapart] = useState([]);
  const [pemintaList, setPemintaList] = useState([]);
  const [tujuanList, setTujuanList] = useState([]);

  const [searchPart, setSearchPart] = useState("");
  const [searchPeminta, setSearchPeminta] = useState("");
  const [searchTujuan, setSearchTujuan] = useState("");

  const [form, setForm] = useState({
    partnumber: "",
    nama: "",
    jumlah: "",
    harga: "",
    totalHarga: "",
    peminta: "",
    tujuan: "",
    noDO: "",
    waktu: "",
    ket: "",
    status: "pending",
  });

  const [editId, setEditId] = useState(null);

  // =============================
  // AUTO TANGGAL & WAKTU
  // =============================
  const nowDateTime = () => {
    const d = new Date();
    const date = d.toISOString().substring(0, 10);
    const time = d.toTimeString().split(" ")[0];
    return `${date} ${time}`;
  };

  // =============================
  // AUTH
  // =============================
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // =============================
  // LOAD BARANG KELUAR
  // =============================
  useEffect(() => {
    const r = ref(database, "barangkeluar");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setItems(Object.values(data));
    });
  }, []);

  // =============================
  // LOAD MASTER DATA
  // =============================
  useEffect(() => {
    onValue(ref(database, "datasparepart"), (snap) => {
      const data = snap.val() || {};
      setDatapart(Object.values(data));
    });

    onValue(ref(database, "peminta"), (snap) => {
      const data = snap.val() || {};
      setPemintaList(Object.values(data));
    });

    onValue(ref(database, "tujuan"), (snap) => {
      const data = snap.val() || {};
      setTujuanList(Object.values(data));
    });
  }, []);

  if (loadingAuth) return <p>Checking login…</p>;

  // =============================
  // HANDLE INPUT
  // =============================
  const onChange = (e) => {
    let newForm = { ...form, [e.target.name]: e.target.value };

    if (e.target.name === "jumlah") {
      const qty = Number(e.target.value) || 0;
      const harga = Number(form.harga) || 0;
      newForm.totalHarga = qty * harga;
    }

    setForm(newForm);
  };

  // =============================
  // PILIH PART DARI DATAPART
  // =============================
  const applyPart = (p) => {
    setForm({
      ...form,
      partnumber: p.partnumber,
      nama: p.nama,
      harga: Number(p.harga) || 0,
      jumlah: "",
      totalHarga: "",
      waktu: nowDateTime(),
    });

    setSearchPart("");
  };

  // =============================
  // PILIH PEMINTA
  // =============================
  const applyPeminta = (p) => {
    setForm({ ...form, peminta: p.nama });
    setSearchPeminta("");
  };

  // =============================
  // PILIH TUJUAN
  // =============================
  const applyTujuan = (t) => {
    setForm({ ...form, tujuan: t.nama });
    setSearchTujuan("");
  };

  // =============================
  // SAVE
  // =============================
  const saveItem = () => {
    if (!form.partnumber) return alert("Pilih sparepart!");
    if (!form.jumlah) return alert("Jumlah wajib!");
    if (!form.peminta) return alert("Peminta wajib!");
    if (!form.tujuan) return alert("Tujuan wajib!");

    if (editId) {
      update(ref(database, "barangkeluar/" + editId), form);
      setEditId(null);
    } else {
      const id = push(ref(database, "barangkeluar")).key;
      set(ref(database, "barangkeluar/" + id), { ...form, id });
    }

    setForm({
      partnumber: "",
      nama: "",
      jumlah: "",
      harga: "",
      totalHarga: "",
      peminta: "",
      tujuan: "",
      noDO: "",
      waktu: "",
      ket: "",
      status: "pending",
    });
  };

  // =============================
  // EDIT
  // =============================
  const doEdit = (i) => {
    if (i.status !== "pending")
      return alert("Tidak bisa edit karena sudah APPROVED!");

    setEditId(i.id);
    setForm(i);
  };

  // =============================
  // DELETE
  // =============================
  const doDelete = (id, status) => {
    if (status !== "pending")
      return alert("Tidak bisa hapus karena sudah APPROVED!");

    if (window.confirm("Hapus data?"))
      remove(ref(database, "barangkeluar/" + id));
  };

  // =============================
  // PRINT DO BUTTON
  // =============================
  const goPrintDO = (noDO) => {
    if (!noDO || noDO.trim() === "") {
      return alert("No. DO belum diisi!");
    }
    navigate(`/do-print?noDO=${noDO}`);
  };

  // =============================
  // FILTER SEARCH
  // =============================
  const filteredPart = datapart.filter(
    (p) =>
      p.partnumber.toLowerCase().includes(searchPart.toLowerCase()) ||
      p.nama.toLowerCase().includes(searchPart.toLowerCase())
  );

  const filteredPeminta = pemintaList.filter((p) =>
    p.nama.toLowerCase().includes(searchPeminta.toLowerCase())
  );

  const filteredTujuan = tujuanList.filter((t) =>
    t.nama.toLowerCase().includes(searchTujuan.toLowerCase())
  );

  // =============================
  // TOTAL PENGELUARAN
  // =============================
  const totalPengeluaran = items.reduce(
    (t, a) => t + Number(a.totalHarga || 0),
    0
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>➖ Barang Keluar</h2>

      {/* NAVIGATION */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/approval-barang-keluar")}>
          📝 Approval
        </button>
        <button onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
        <button onClick={() => navigate("/stock-opname")}>📋 Stock Opname</button>
        <button onClick={() => navigate("/field-inventory")}>
          🧭 Field Inventory
        </button>

        {/* MASTER DATA */}
        <button onClick={() => navigate("/data-part")}>🛠 Sparepart</button>
        <button onClick={() => navigate("/supplier")}>🏬 Supplier</button>
        <button onClick={() => navigate("/peminta")}>👤 Peminta</button>
        <button onClick={() => navigate("/tujuan")}>🎯 Tujuan</button>

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

      {/* ========================= FORM INPUT ========================= */}
      <h3>{editId ? "Edit Barang Keluar" : "Tambah Barang Keluar"}</h3>

      {/* SEARCH SPAREPART */}
      <input
        placeholder="Cari Part Number / Nama"
        value={searchPart}
        onChange={(e) => setSearchPart(e.target.value)}
      />

      {searchPart && (
        <div style={{ border: "1px solid #ccc", width: 300, background: "#f7f7f7" }}>
          {filteredPart.map((p) => (
            <div
              key={p.id}
              onClick={() => applyPart(p)}
              style={{ padding: 6, cursor: "pointer", borderBottom: "1px solid #ddd" }}
            >
              <b>{p.partnumber}</b> — {p.nama}
            </div>
          ))}
        </div>
      )}

      <br />

      {/* FORM INPUT */}
      <input name="partnumber" value={form.partnumber} readOnly />
      <input name="nama" value={form.nama} readOnly />

      <input
        name="jumlah"
        type="number"
        placeholder="Jumlah"
        value={form.jumlah}
        onChange={onChange}
      />

      <input name="harga" value={form.harga} readOnly />

      <input name="totalHarga" value={form.totalHarga} readOnly />

      {/* PEMINTA */}
      <input
        placeholder="Cari Peminta"
        value={searchPeminta}
        onChange={(e) => setSearchPeminta(e.target.value)}
      />

      {searchPeminta && (
        <div style={{ border: "1px solid #ccc", width: 300, background: "#eef" }}>
          {filteredPeminta.map((p) => (
            <div
              key={p.id}
              onClick={() => applyPeminta(p)}
              style={{ padding: 5, cursor: "pointer" }}
            >
              {p.nama}
            </div>
          ))}
        </div>
      )}

      <input name="peminta" value={form.peminta} readOnly />

      {/* TUJUAN */}
      <input
        placeholder="Cari Tujuan"
        value={searchTujuan}
        onChange={(e) => setSearchTujuan(e.target.value)}
      />

      {searchTujuan && (
        <div style={{ border: "1px solid #ccc", width: 300, background: "#efe" }}>
          {filteredTujuan.map((t) => (
            <div
              key={t.id}
              onClick={() => applyTujuan(t)}
              style={{ padding: 5, cursor: "pointer" }}
            >
              {t.nama}
            </div>
          ))}
        </div>
      )}

      <input name="tujuan" value={form.tujuan} readOnly />

      <input
        name="noDO"
        placeholder="No. DO"
        value={form.noDO}
        onChange={onChange}
      />

      <input
        name="waktu"
        placeholder="Waktu"
        value={form.waktu}
        readOnly
      />

      <input
        name="ket"
        placeholder="Keterangan"
        value={form.ket}
        onChange={onChange}
      />

      <br />
      <button onClick={saveItem}>{editId ? "Update" : "Simpan"}</button>

      <hr />

      {/* ========================= TABLE ========================= */}
      <h3>Riwayat Barang Keluar</h3>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>No DO</th>
            <th>Part Number</th>
            <th>Nama</th>
            <th>Jumlah</th>
            <th>Harga</th>
            <th>Total</th>
            <th>Peminta</th>
            <th>Tujuan</th>
            <th>Waktu</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.noDO}</td>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.jumlah}</td>
              <td>{i.harga}</td>
              <td>{i.totalHarga}</td>
              <td>{i.peminta}</td>
              <td>{i.tujuan}</td>
              <td>{i.waktu}</td>
              <td>{i.status}</td>

              <td>
                <button onClick={() => doEdit(i)}>Edit</button>
                <button onClick={() => doDelete(i.id, i.status)}>Hapus</button>

                {/* PRINT DO BUTTON */}
                <button onClick={() => goPrintDO(i.noDO)}>📄 Print DO</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>
        💰 Total Pengeluaran: Rp {totalPengeluaran.toLocaleString()}
      </h3>
    </div>
  );
}
