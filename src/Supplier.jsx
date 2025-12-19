import { useEffect, useState, useRef } from "react";
import { database, auth } from "./firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function Supplier() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [suppliers, setSuppliers] = useState([]);

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    telp: "",
  });

  const [editId, setEditId] = useState(null);

  // AUTH SESSION
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // LOAD DATABASE SUPPLIER
  useEffect(() => {
    const r = ref(database, "supplier");
    return onValue(r, (snap) => {
      const d = snap.val() || {};
      const arr = Object.keys(d).map((key) => ({ id: key, ...d[key] }));
      setSuppliers(arr);
    });
  }, []);

  if (loadingAuth) return <div style={styles.loading}>Checking Session...</div>;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveData = async () => {
    if (!form.nama) return alert("Nama supplier wajib diisi!");

    try {
      if (editId) {
        await update(ref(database, "supplier/" + editId), form);
        setEditId(null);
      } else {
        const id = push(ref(database, "supplier")).key;
        await set(ref(database, "supplier/" + id), { id, ...form });
      }
      setForm({ nama: "", alamat: "", telp: "" });
      alert("Data berhasil disimpan!");
    } catch (err) {
      alert("Gagal menyimpan data");
    }
  };

  const editRow = (s) => {
    setEditId(s.id);
    setForm({ nama: s.nama, alamat: s.alamat, telp: s.telp });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = (id) => {
    if (window.confirm("Hapus supplier ini secara permanen?"))
      remove(ref(database, "supplier/" + id));
  };

  const exportExcel = () => {
    const data = suppliers.map((s) => ({
      Nama: s.nama,
      Alamat: s.alamat,
      Telepon: s.telp,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Supplier");
    XLSX.writeFile(wb, "master_supplier.xlsx");
  };

  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      rows.forEach((r) => {
        if (!r["Nama"]) return;
        const id = push(ref(database, "supplier")).key;
        set(ref(database, "supplier/" + id), {
          id,
          nama: r["Nama"],
          alamat: r["Alamat"] || "",
          telp: r["Telepon"] || "",
        });
      });

      alert("Import berhasil!");
      e.target.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: "#7b003f" }}>🏭 Master Supplier</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI LENGKAP (Sinkron dengan Inventory & DataPart) */}
      <div style={styles.fullNavBar}>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>SISTEM</span>
          <button style={styles.btnNav} onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
          <button style={styles.btnNav} onClick={() => navigate("/inventory")}>📦 Inventory</button>
        </div>
        
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>MASTER DATA</span>
          <button style={styles.btnNav} onClick={() => navigate("/datapart")}>🛠 Datapart</button>
          <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}} onClick={() => navigate("/supplier")}>🏢 Supplier</button>
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

      {/* FORM INPUT SECTION */}
      <div style={styles.card}>
        <h3>{editId ? "📝 Edit Supplier" : "✨ Tambah Supplier Baru"}</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={styles.label}>Nama Supplier</label>
            <input name="nama" placeholder="Contoh: PT. ABC" value={form.nama} onChange={onChange} style={styles.input} />
          </div>
          <div style={{ flex: 2, minWidth: "200px" }}>
            <label style={styles.label}>Alamat</label>
            <input name="alamat" placeholder="Alamat Lengkap" value={form.alamat} onChange={onChange} style={styles.input} />
          </div>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={styles.label}>No. Telepon</label>
            <input name="telp" placeholder="0812..." value={form.telp} onChange={onChange} style={styles.input} />
          </div>
          <button onClick={saveData} style={styles.btnSave}>{editId ? "Update" : "Simpan"}</button>
          {editId && <button onClick={() => { setEditId(null); setForm({ nama: "", alamat: "", telp: "" }); }} style={styles.btnCancel}>Batal</button>}
        </div>
      </div>

      {/* ACTION BAR */}
      <div style={{ marginBottom: 15, display: "flex", gap: 10 }}>
        <button onClick={() => fileInputRef.current.click()} style={styles.btnImport}>⬆ Import Excel</button>
        <button onClick={exportExcel} style={styles.btnExport}>⬇ Export Excel</button>
        <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={importExcel} style={{ display: "none" }} />
      </div>

      {/* TABLE SECTION */}
      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={{ background: "#f2f2f2" }}>
                <th style={styles.th}>Nama Supplier</th>
                <th style={styles.th}>Alamat</th>
                <th style={styles.th}>Telepon</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length > 0 ? suppliers.map((s) => (
                <tr key={s.id} style={styles.tr}>
                  <td style={styles.td}><b>{s.nama}</b></td>
                  <td style={styles.td}>{s.alamat}</td>
                  <td style={styles.td}>{s.telp}</td>
                  <td style={styles.td}>
                    <button onClick={() => editRow(s)} style={styles.btnEditSmall}>Edit</button>
                    <button onClick={() => deleteRow(s.id)} style={styles.btnDelSmall}>Hapus</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{textAlign: "center", padding: 20}}>Belum ada data supplier.</td></tr>
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
  btnImport: { background: "#28a745", color: "#fff", border: "none", padding: "8px 15px", borderRadius: 4, cursor: "pointer" },
  btnExport: { background: "#007bff", color: "#fff", border: "none", padding: "8px 15px", borderRadius: 4, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", color: "#666", fontSize: "13px", borderBottom: "2px solid #eee" },
  td: { padding: "12px", fontSize: "14px", borderBottom: "1px solid #f9f9f9" },
  tr: { transition: "0.2s" },
  btnEditSmall: { marginRight: 5, background: "#ffc107", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" },
  btnDelSmall: { background: "#dc3545", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  loading: { textAlign: "center", padding: 50 }
};