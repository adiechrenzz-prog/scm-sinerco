import { useEffect, useState } from "react";
import { database, auth } from "./firebase";
import { ref, push, set, onValue, update, remove } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Peminta() {
  const navigate = useNavigate();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ nama: "", jabatan: "" });
  const [editId, setEditId] = useState(null);

  // AUTH SESSION
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // LOAD DATABASE
  useEffect(() => {
    const r = ref(database, "peminta");
    return onValue(r, snap => {
      const d = snap.val() || {};
      const arr = Object.keys(d).map(key => ({ id: key, ...d[key] }));
      setList(arr);
    });
  }, []);

  if (loadingAuth) return <div style={styles.loading}>Checking Session...</div>;

  const save = async () => {
    if (!form.nama) return alert("Nama wajib diisi!");

    try {
      if (editId) {
        await update(ref(database, "peminta/" + editId), form);
        setEditId(null);
      } else {
        const id = push(ref(database, "peminta")).key;
        await set(ref(database, "peminta/" + id), { id, ...form });
      }
      setForm({ nama: "", jabatan: "" });
      alert("Data berhasil disimpan!");
    } catch (err) {
      alert("Gagal menyimpan data");
    }
  };

  const editRow = (r) => {
    setEditId(r.id);
    setForm({ nama: r.nama, jabatan: r.jabatan });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = (id) => {
    if (window.confirm("Hapus data peminta ini?"))
      remove(ref(database, "peminta/" + id));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: "#7b003f" }}>👤 Master Peminta Barang</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI LENGKAP (Sinkron dengan halaman lainnya) */}
      <div style={styles.fullNavBar}>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>SISTEM</span>
          <button style={styles.btnNav} onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
          <button style={styles.btnNav} onClick={() => navigate("/inventory")}>📦 Inventory</button>
        </div>
        
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>MASTER DATA</span>
          <button style={styles.btnNav} onClick={() => navigate("/datapart")}>🛠 Datapart</button>
          <button style={styles.btnNav} onClick={() => navigate("/supplier")}>🏢 Supplier</button>
          <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}} onClick={() => navigate("/peminta")}>👤 Peminta</button>
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

      {/* FORM SECTION */}
      <div style={styles.card}>
        <h3>{editId ? "📝 Edit Peminta" : "✨ Tambah Peminta Baru"}</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={styles.label}>Nama Lengkap</label>
            <input 
              placeholder="Masukkan Nama" 
              value={form.nama} 
              onChange={(e) => setForm({ ...form, nama: e.target.value })} 
              style={styles.input} 
            />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={styles.label}>Jabatan / Departemen</label>
            <input 
              placeholder="Contoh: Mechanic" 
              value={form.jabatan} 
              onChange={(e) => setForm({ ...form, jabatan: e.target.value })} 
              style={styles.input} 
            />
          </div>
          <button onClick={save} style={styles.btnSave}>{editId ? "Update" : "Simpan"}</button>
          {editId && <button onClick={() => { setEditId(null); setForm({ nama: "", jabatan: "" }); }} style={styles.btnCancel}>Batal</button>}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={{ background: "#f2f2f2" }}>
                <th style={styles.th}>Nama</th>
                <th style={styles.th}>Jabatan</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? list.map((r) => (
                <tr key={r.id} style={styles.tr}>
                  <td style={styles.td}><b>{r.nama}</b></td>
                  <td style={styles.td}>{r.jabatan}</td>
                  <td style={styles.td}>
                    <button onClick={() => editRow(r)} style={styles.btnEditSmall}>Edit</button>
                    <button onClick={() => deleteRow(r.id)} style={styles.btnDelSmall}>Hapus</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="3" style={{textAlign: "center", padding: 20}}>Data peminta kosong.</td></tr>
              )}
            </tbody>
          </table>
        </div>
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
  label: { display: "block", fontSize: "12px", marginBottom: "5px", fontWeight: "bold" },
  input: { padding: "10px", borderRadius: "4px", border: "1px solid #ddd", width: "100%", boxSizing: "border-box" },
  btnSave: { background: "#7b003f", color: "#fff", border: "none", padding: "11px 25px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" },
  btnCancel: { background: "#6c757d", color: "#fff", border: "none", padding: "11px 15px", borderRadius: "4px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", color: "#666", fontSize: "13px", borderBottom: "2px solid #eee" },
  td: { padding: "12px", fontSize: "14px", borderBottom: "1px solid #f9f9f9" },
  btnEditSmall: { marginRight: 5, background: "#ffc107", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" },
  btnDelSmall: { background: "#dc3545", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  loading: { textAlign: "center", padding: 50 }
};