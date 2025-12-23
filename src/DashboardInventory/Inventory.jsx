import { useEffect, useState, useRef } from "react";
import { database, auth } from "../firebase";
import { ref, onValue, push, set, remove, update } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function Inventory() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [searchText, setSearchText] = useState(""); 
  const [tableFilter, setTableFilter] = useState(""); 
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    partnumber: "", nama: "", stok: "", satuan: "", harga: "", gudang: "", rack: "",
  });

  const formatIDR = (val) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });

    const rItems = ref(database, "items");
    const unsubItems = onValue(rItems, (snap) => {
      const data = snap.val() || {};
      const arr = Object.keys(data).map(k => ({ id: k, ...data[k] }));
      setItems(arr);
    });

    const rMaster = ref(database, "datasparepart");
    const unsubMaster = onValue(rMaster, (snap) => {
      const data = snap.val() || {};
      setSpareparts(Object.values(data));
    });

    return () => { unsubAuth(); unsubItems(); unsubMaster(); };
  }, [navigate]);

  if (loadingAuth) return <div style={styles.loading}>Checking Session...</div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applySparepart = (sp) => {
    setForm({ ...form, partnumber: sp.partnumber, nama: sp.nama, harga: sp.harga || 0 });
    setSearchText("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ partnumber: "", nama: "", stok: "", satuan: "", harga: "", gudang: "", rack: "" });
  };

  const saveItem = async () => {
    if (!form.partnumber || !form.nama) return alert("Part Number & Nama wajib diisi!");
    const payload = { ...form, stok: Number(form.stok) || 0, harga: Number(form.harga) || 0 };
    try {
      if (editId) {
        await update(ref(database, "items/" + editId), payload);
        setEditId(null);
      } else {
        const newKey = push(ref(database, "items")).key;
        await set(ref(database, "items/" + newKey), { id: newKey, ...payload });
      }
      setForm({ partnumber: "", nama: "", stok: "", satuan: "", harga: "", gudang: "", rack: "" });
      alert("Data berhasil disimpan!");
    } catch (err) { alert("Gagal menyimpan data"); }
  };

  const deleteItem = (id) => {
    if (window.confirm("Hapus data ini secara permanen?")) remove(ref(database, "items/" + id));
  };

  const filteredTableItems = items.filter(item => 
    String(item.partnumber || "").toLowerCase().includes(tableFilter.toLowerCase()) ||
    String(item.nama || "").toLowerCase().includes(tableFilter.toLowerCase()) ||
    String(item.gudang || "").toLowerCase().includes(tableFilter.toLowerCase())
  );

  const totalSumFiltered = filteredTableItems.reduce((acc, item) => acc + (Number(item.stok) * Number(item.harga)), 0);

  return (
    <div style={styles.container}>
      {/* HEADER UTAMA */}
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: "#7b003f" }}>📦 Inventory Management</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI LENGKAP */}
      <div style={styles.fullNavBar}>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>SISTEM</span>
          <button style={styles.btnNav} onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
          <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}} onClick={() => navigate("/inventory")}>📦 Inventory</button>
        </div>
        
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>MASTER DATA</span>
          <button style={styles.btnNav} onClick={() => navigate("/datapart")}>🛠 Datapart</button>
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

      <div style={styles.mainGrid}>
        {/* KOLOM KIRI: FORM INPUT */}
        <div style={{ flex: 1 }}>
          <div style={styles.card}>
            <h4>🔍 Ambil dari Master Sparepart</h4>
            <input 
              style={styles.inputFull} 
              placeholder="Ketik Part Number Master..." 
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)} 
            />
            {searchText && (
              <div style={styles.searchResult}>
                {spareparts.filter(s => String(s.partnumber).toLowerCase().includes(searchText.toLowerCase())).map(sp => (
                  <div key={sp.id} style={styles.searchItem} onClick={() => applySparepart(sp)}>
                    <b>{sp.partnumber}</b> - {sp.nama}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <h4>{editId ? "📝 Edit Item" : "➕ Input Inventory"}</h4>
            <div style={styles.formVertical}>
              <input name="partnumber" placeholder="Part Number" style={styles.input} value={form.partnumber} onChange={handleChange} />
              <input name="nama" placeholder="Nama Barang" style={styles.input} value={form.nama} onChange={handleChange} />
              <div style={{display: 'flex', gap: 10}}>
                <input name="stok" type="number" placeholder="Stok" style={styles.input} value={form.stok} onChange={handleChange} />
                <input name="satuan" placeholder="Satuan" style={styles.input} value={form.satuan} onChange={handleChange} />
              </div>
              <input name="harga" type="number" placeholder="Harga Satuan" style={styles.input} value={form.harga} onChange={handleChange} />
              <div style={{display: 'flex', gap: 10}}>
                <input name="gudang" placeholder="Gudang" style={styles.input} value={form.gudang} onChange={handleChange} />
                <input name="rack" placeholder="Rack" style={styles.input} value={form.rack} onChange={handleChange} />
              </div>
              
              <button style={styles.btnSave} onClick={saveItem}>{editId ? "Update Data" : "Simpan Ke Inventory"}</button>
              {editId && <button style={styles.btnCancel} onClick={cancelEdit}>Batal Edit</button>}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: TABEL DATA */}
        <div style={{ flex: 2.5 }}>
          <div style={styles.summaryRow}>
            <div style={styles.summaryCard}>
              <small>Total Nilai Inventory</small>
              <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#7b003f" }}>{formatIDR(totalSumFiltered)}</div>
            </div>
            <div style={{ flex: 1 }}>
              <input 
                style={styles.inputFull} 
                placeholder="🔎 Filter tabel (Nama / Part / Gudang)..." 
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: "#f2f2f2" }}>
                    <th style={styles.th}>Part Number</th>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>Stok</th>
                    <th style={styles.th}>Total Nilai</th>
                    <th style={styles.th}>Lokasi</th>
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableItems.map((i) => (
                    <tr key={i.id} style={styles.tr}>
                      <td style={styles.td}>{i.partnumber}</td>
                      <td style={styles.td}>{i.nama}</td>
                      <td style={styles.td}><b>{i.stok}</b> {i.satuan}</td>
                      <td style={styles.td}>{formatIDR(i.stok * i.harga)}</td>
                      <td style={styles.td}><small>{i.gudang} / {i.rack}</small></td>
                      <td style={styles.td}>
                        <button style={styles.btnEdit} onClick={() => { setEditId(i.id); setForm(i); window.scrollTo(0,0); }}>Edit</button>
                        <button style={styles.btnDel} onClick={() => deleteItem(i.id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", fontFamily: "sans-serif", backgroundColor: "#f4f7f6", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  fullNavBar: { display: "flex", gap: "20px", marginBottom: "20px", background: "#fff", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", flexWrap: "wrap" },
  navGroup: { display: "flex", flexDirection: "column", gap: "5px", borderLeft: "3px solid #7b003f", paddingLeft: "12px" },
  navLabel: { fontSize: "10px", fontWeight: "bold", color: "#7b003f", marginBottom: "2px" },
  btnNav: { padding: "7px 12px", cursor: "pointer", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px", textAlign: "left" },
  mainGrid: { display: "flex", gap: "20px", flexWrap: "wrap" },
  card: { background: "#fff", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", marginBottom: 15 },
  formVertical: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "6px", border: "1px solid #ddd", width: "100%", boxSizing: "border-box" },
  inputFull: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" },
  summaryRow: { display: "flex", gap: "15px", alignItems: "center", marginBottom: "15px" },
  summaryCard: { background: "#fff", padding: "10px 20px", borderRadius: "10px", borderLeft: "5px solid #7b003f", minWidth: "200px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px", textAlign: "left", borderBottom: "2px solid #eee", fontSize: "12px", color: "#666" },
  td: { padding: "10px", borderBottom: "1px solid #f9f9f9", fontSize: "13px" },
  btnSave: { background: "#7b003f", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginTop: 5 },
  btnCancel: { background: "#6c757d", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer" },
  btnEdit: { background: "#ffc107", border: "none", padding: "4px 8px", borderRadius: "4px", marginRight: 4 },
  btnDel: { background: "#dc3545", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px" },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px" },
  searchResult: { border: "1px solid #ddd", background: "#fff", position: "absolute", width: "250px", zIndex: 10, maxHeight: 150, overflowY: "auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
  searchItem: { padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "12px" },
  loading: { textAlign: "center", padding: 50 }
};