import { useState, useEffect, useRef } from "react";
import { database, auth } from "../firebase";
import { ref, onValue, push, set, remove, update } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function DataPart() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    partnumber: "",
    nama: "",
    harga: "",
  });

  const [editId, setEditId] = useState(null);

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
    return () => unsub();
  }, [navigate]);

  // LOAD DB
  useEffect(() => {
    const r = ref(database, "datasparepart");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      const arr = Object.keys(data).map(key => ({
        ...data[key],
        id: key,
        harga: Number(data[key].harga) || 0
      }));
      setItems(arr);
    });
  }, []);

  if (loadingAuth) return <p style={{ textAlign: 'center', marginTop: 50 }}>Checking login...</p>;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveItem = async () => {
    if (!form.partnumber || !form.nama) {
      alert("Part Number & Nama wajib diisi!");
      return;
    }
    const payload = { ...form, harga: Number(form.harga) || 0 };
    try {
      if (editId) {
        await update(ref(database, "datasparepart/" + editId), payload);
        setEditId(null);
      } else {
        const id = push(ref(database, "datasparepart")).key;
        await set(ref(database, "datasparepart/" + id), { id, ...payload });
      }
      setForm({ partnumber: "", nama: "", harga: "" });
      alert("Data berhasil disimpan!");
    } catch (err) {
      alert("Gagal simpan: " + err.message);
    }
  };

  const deleteItem = (id) => {
    if (window.confirm("Hapus sparepart ini?")) {
      remove(ref(database, "datasparepart/" + id));
    }
  };

  const editItem = (item) => {
    setEditId(item.id);
    setForm({
      partnumber: item.partnumber,
      nama: item.nama,
      harga: item.harga
    });
    window.scrollTo(0, 0);
  };

  const filteredAndSorted = items
    .filter(i => 
      String(i.nama).toLowerCase().includes(searchTerm.toLowerCase()) || 
      String(i.partnumber).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => String(a.partnumber).localeCompare(String(b.partnumber), undefined, { numeric: true }));

  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      rows.forEach((row) => {
        const pn = String(row["Part Number"] || row["partnumber"] || "");
        const nama = String(row["Nama Sparepart"] || row["nama"] || "");
        const harga = Number(row["Harga"] || row["harga"]) || 0;
        if (pn && nama) {
          const id = push(ref(database, "datasparepart")).key;
          set(ref(database, "datasparepart/" + id), { id, partnumber: pn, nama, harga });
        }
      });
      alert("Import Selesai!");
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#7b003f' }}>🛠 Master Data Sparepart</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI FULL (Sama dengan Inventory) */}
      <div style={styles.fullNavBar}>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>SISTEM</span>
          <button style={styles.btnNav} onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
          <button style={styles.btnNav} onClick={() => navigate("/inventory")}>📦 Inventory</button>
        </div>
        
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>MASTER DATA</span>
          <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}} onClick={() => navigate("/datapart")}>🛠 Datapart</button>
          <button style={styles.btnNav} onClick={() => navigate("/supplier")}>🏢 Supplier</button>
          <button style={styles.btnNav} onClick={() => navigate("/peminta")}>👤 Peminta</button>
          <button style={styles.btnNav} onClick={() => navigate("/tujuan")}>📍 Tujuan</button>
        </div>

        <div style={styles.navGroup}>
          <span style={styles.navLabel}>TRANSAKSI</span>
          <button style={styles.btnNav} onClick={() => navigate("/barang-masuk")}>📥 Masuk</button>
          <button style={styles.btnNav} onClick={() => navigate("/barang-keluar")}>📤 Keluar</button>
        </div>

        <div style={styles.navGroup}>
          <span style={styles.navLabel}>LAPORAN</span>
          <button style={styles.btnNav} onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
          <button style={styles.btnNav} onClick={() => navigate("/stock-opname")}>📋 Opname</button>
        </div>
      </div>

      <div style={styles.card}>
        <h3>{editId ? "📝 Edit Sparepart" : "✨ Tambah Sparepart Baru"}</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input name="partnumber" placeholder="Part Number" value={form.partnumber} onChange={handleChange} style={styles.input} />
          <input name="nama" placeholder="Nama Sparepart" value={form.nama} onChange={handleChange} style={{ ...styles.input, flex: 2 }} />
          <input name="harga" type="number" placeholder="Harga Satuan" value={form.harga} onChange={handleChange} style={styles.input} />
          <button onClick={saveItem} style={styles.btnSimpan}>{editId ? "Update" : "Simpan"}</button>
          {editId && <button style={styles.btnCancel} onClick={() => { setEditId(null); setForm({ partnumber: "", nama: "", harga: "" }); }}>Batal</button>}
        </div>
        <div style={{marginTop: 15}}>
           <button onClick={() => fileRef.current.click()} style={styles.btnImport}>⬆ Import Excel</button>
           <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={importExcel} />
        </div>
      </div>

      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <strong>Total: {filteredAndSorted.length} Item</strong>
        <input 
          placeholder="Cari Part Number / Nama..." 
          style={styles.searchBar}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={styles.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th style={styles.th}>Part Number</th>
              <th style={styles.th}>Nama Sparepart</th>
              <th style={styles.th}>Harga Satuan</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((i) => (
              <tr key={i.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={styles.td}><b>{i.partnumber}</b></td>
                <td style={styles.td}>{i.nama}</td>
                <td style={styles.td}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(i.harga)}</td>
                <td style={styles.td}>
                  <button onClick={() => editItem(i)} style={styles.btnEditSmall}>Edit</button>
                  <button onClick={() => deleteItem(i.id)} style={styles.btnDelSmall}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", backgroundColor: "#f4f7f6", minHeight: "100vh", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  fullNavBar: { display: "flex", gap: "20px", marginBottom: "20px", background: "#fff", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", flexWrap: "wrap" },
  navGroup: { display: "flex", flexDirection: "column", gap: "5px", borderLeft: "3px solid #7b003f", paddingLeft: "12px" },
  navLabel: { fontSize: "10px", fontWeight: "bold", color: "#7b003f", marginBottom: "2px" },
  btnNav: { padding: "7px 12px", cursor: "pointer", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px", textAlign: "left" },
  card: { background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", marginBottom: 20 },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '150px' },
  searchBar: { padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ddd' },
  btnSimpan: { background: '#7b003f', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnCancel: { background: '#6c757d', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' },
  btnImport: { background: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: 4, cursor: 'pointer' },
  th: { padding: '12px', textAlign: 'left', color: '#666', fontSize: '13px' },
  td: { padding: '12px', fontSize: '14px' },
  btnEditSmall: { marginRight: 5, background: '#ffc107', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' },
  btnDelSmall: { background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" }
};