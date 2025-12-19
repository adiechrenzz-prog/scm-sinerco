import { useState, useEffect, useRef } from "react";
import { database, auth } from "./firebase";
import { ref, onValue, push, set, remove, update } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function BarangMasuk() {
  const navigate = useNavigate();
  const today = new Date().toISOString().substring(0, 10);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [data, setData] = useState([]);
  const [masterPart, setMasterPart] = useState([]);
  const [masterSupplier, setMasterSupplier] = useState([]);

  const [searchPart, setSearchPart] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    partnumber: "",
    nama: "",
    jumlah: "",
    harga: "",
    total: 0,
    supplier: "",
    invoice: "",
    waktu: today,
    ket: "",
  });

  const formatIDR = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("id-ID", { 
        style: "currency", 
        currency: "IDR", 
        minimumFractionDigits: 0 
    }).format(num);
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });

    const unsubBM = onValue(ref(database, "barangmasuk"), (snap) => {
      const d = snap.val() || {};
      const arr = Object.keys(d).map(key => ({
        ...d[key],
        id: key,
        jumlah: Number(d[key].jumlah) || 0,
        harga: Number(d[key].harga) || 0,
        total: Number(d[key].total) || (Number(d[key].jumlah) * Number(d[key].harga)) || 0
      })).sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
      setData(arr);
    });

    const unsubPart = onValue(ref(database, "datasparepart"), (snap) => {
      const d = snap.val() || {};
      setMasterPart(Object.values(d));
    });

    const unsubSup = onValue(ref(database, "supplier"), (snap) => {
      const d = snap.val() || {};
      setMasterSupplier(Object.values(d));
    });

    return () => { unsubAuth(); unsubBM(); unsubPart(); unsubSup(); };
  }, [navigate]);

  if (loadingAuth) return <div style={styles.loading}>Checking Session...</div>;

  const handleForm = (e) => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };

    if (name === "jumlah" || name === "harga") {
      const qty = Number(name === "jumlah" ? value : form.jumlah) || 0;
      const hrg = Number(name === "harga" ? value : form.harga) || 0;
      newForm.total = qty * hrg;
    }
    setForm(newForm);
  };

  const applyPart = (p) => {
    const qty = Number(form.jumlah) || 0;
    const hrg = Number(p.harga) || 0;
    setForm({ ...form, partnumber: p.partnumber, nama: p.nama, harga: hrg, total: qty * hrg });
    setSearchPart("");
  };

  const applySupplier = (s) => {
    setForm({ ...form, supplier: s.nama });
    setSearchSupplier("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ partnumber: "", nama: "", jumlah: "", harga: "", total: 0, supplier: "", invoice: "", waktu: today, ket: "" });
  };

  const saveData = async () => {
    if (!form.partnumber || Number(form.jumlah) <= 0) return alert("Pilih barang dan isi jumlah!");

    const payload = {
      ...form,
      jumlah: Number(form.jumlah),
      harga: Number(form.harga),
      total: Number(form.jumlah) * Number(form.harga)
    };

    try {
      if (editId) {
        await update(ref(database, "barangmasuk/" + editId), payload);
      } else {
        const id = push(ref(database, "barangmasuk")).key;
        await set(ref(database, "barangmasuk/" + id), { ...payload, id });
      }
      alert("Data berhasil diproses!");
      cancelEdit();
    } catch (err) { alert("Error simpan data"); }
  };

  const filteredTable = data.filter(i => 
    String(i.invoice + i.nama + i.partnumber + i.supplier + i.waktu).toLowerCase().includes(tableFilter.toLowerCase())
  );

  const grandTotal = filteredTable.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: "#7b003f" }}>📥 Transaksi Barang Masuk</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI LENGKAP (Sinkron dengan modul lain) */}
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
          <button style={styles.btnNav} onClick={() => navigate("/peminta")}>👤 Peminta</button>
          <button style={styles.btnNav} onClick={() => navigate("/tujuan")}>📍 Tujuan</button>
        </div>

        <div style={styles.navGroup}>
          <span style={styles.navLabel}>TRANSAKSI</span>
          <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}} onClick={() => navigate("/barang-masuk")}>📥 Masuk</button>
          <button style={styles.btnNav} onClick={() => navigate("/barang-keluar")}>📤 Keluar</button>
        </div>

        <div style={styles.navGroup}>
          <span style={styles.navLabel}>LAPORAN</span>
          <button style={styles.btnNav} onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
          <button style={styles.btnNav} onClick={() => navigate("/stock-opname")}>📋 Opname</button>
        </div>
      </div>

      <div style={styles.summaryCard}>
          <div>
              <span style={styles.summaryLabel}>Total Nilai Transaksi Terfilter</span>
              <h1 style={styles.summaryValue}>{formatIDR(grandTotal)}</h1>
          </div>
          <div style={{ textAlign: "right" }}>
              <span style={styles.summaryLabel}>Jumlah Transaksi</span>
              <h2 style={styles.summaryValue}>{filteredTable.length} Data</h2>
          </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={{ flex: 1, minWidth: "350px" }}>
          <div style={styles.card}>
            <h4>🔍 1. Cari Item & Supplier</h4>
            <input style={styles.inputFull} placeholder="Cari Part Number / Nama..." value={searchPart} onChange={(e) => setSearchPart(e.target.value)} />
            {searchPart && (
                <div style={styles.searchResult}>
                    {masterPart.filter(p => String(p.partnumber + p.nama).toLowerCase().includes(searchPart.toLowerCase())).map(p => (
                        <div key={p.id} style={styles.searchItem} onClick={() => applyPart(p)}><b>{p.partnumber}</b> — {p.nama}</div>
                    ))}
                </div>
            )}
            <input style={{...styles.inputFull, marginTop: 10}} placeholder="Cari Supplier..." value={searchSupplier} onChange={(e) => setSearchSupplier(e.target.value)} />
            {searchSupplier && (
                <div style={styles.searchResult}>
                    {masterSupplier.filter(s => s.nama.toLowerCase().includes(searchSupplier.toLowerCase())).map(s => (
                        <div key={s.id} style={styles.searchItem} onClick={() => applySupplier(s)}>{s.nama}</div>
                    ))}
                </div>
            )}
          </div>

          <div style={styles.card}>
            <h4>📝 2. Detail Transaksi</h4>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}><label style={styles.label}>Part Number</label><input style={styles.inputDisabled} value={form.partnumber} readOnly /></div>
              <div style={styles.inputGroup}><label style={styles.label}>No. Invoice</label><input name="invoice" style={styles.input} value={form.invoice} onChange={handleForm} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Jumlah</label><input name="jumlah" type="number" style={styles.input} value={form.jumlah} onChange={handleForm} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Harga Beli Satuan</label><input name="harga" type="number" style={styles.input} value={form.harga} onChange={handleForm} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Total Harga</label><div style={styles.totalBox}>{formatIDR(form.total)}</div></div>
              <div style={styles.inputGroup}><label style={styles.label}>Tanggal Masuk</label><input name="waktu" type="date" style={styles.input} value={form.waktu} onChange={handleForm} /></div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button style={{...styles.btnSave, flex: 2}} onClick={saveData}>{editId ? "UPDATE DATA" : "SIMPAN MASUK"}</button>
                {editId && <button style={{...styles.btnCancel, flex: 1}} onClick={cancelEdit}>BATAL</button>}
            </div>
          </div>
        </div>

        <div style={{ flex: 2.5, minWidth: "500px" }}>
            <div style={styles.card}>
                <div style={styles.tableHeader}>
                    <h4>📜 Riwayat Barang Masuk</h4>
                    <input style={{...styles.input, width: "250px"}} placeholder="Cari di tabel..." value={tableFilter} onChange={(e) => setTableFilter(e.target.value)} />
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={{ background: "#f2f2f2" }}>
                                <th style={styles.th}>Tanggal</th>
                                <th style={styles.th}>Invoice</th>
                                <th style={styles.th}>Item / Part</th>
                                <th style={styles.th}>Supplier</th>
                                <th style={styles.th}>Qty</th>
                                <th style={styles.th}>Total</th>
                                <th style={styles.th}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTable.map((i) => (
                                <tr key={i.id} style={styles.tr}>
                                    <td style={styles.td}>{i.waktu}</td>
                                    <td style={styles.td}><b>{i.invoice || "-"}</b></td>
                                    <td style={styles.td}><small>{i.partnumber}</small><br/>{i.nama}</td>
                                    <td style={styles.td}>{i.supplier}</td>
                                    <td style={styles.td}>{i.jumlah}</td>
                                    <td style={{...styles.td, fontWeight: "bold", color: "#7b003f"}}>{formatIDR(i.total)}</td>
                                    <td style={styles.td}>
                                        <button style={styles.btnEditSmall} onClick={() => {setEditId(i.id); setForm(i); window.scrollTo(0,0);}}>Edit</button>
                                        <button style={styles.btnDelSmall} onClick={() => {if(window.confirm("Hapus transaksi ini?")) remove(ref(database, "barangmasuk/"+i.id))}}>Del</button>
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
  container: { padding: "20px", backgroundColor: "#f4f7f6", minHeight: "100vh", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  fullNavBar: { display: "flex", gap: "20px", marginBottom: "20px", background: "#fff", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", flexWrap: "wrap" },
  navGroup: { display: "flex", flexDirection: "column", gap: "5px", borderLeft: "3px solid #7b003f", paddingLeft: "12px" },
  navLabel: { fontSize: "10px", fontWeight: "bold", color: "#7b003f", marginBottom: "2px" },
  btnNav: { padding: "7px 12px", cursor: "pointer", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px", textAlign: "left" },
  summaryCard: { background: "#7b003f", color: "white", padding: "20px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  summaryLabel: { fontSize: "12px", opacity: 0.8 },
  summaryValue: { margin: "5px 0 0 0", fontSize: "1.5rem" },
  mainGrid: { display: "flex", gap: "20px", flexWrap: "wrap" },
  card: { background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", marginBottom: 20, position: "relative" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  inputGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "11px", fontWeight: "bold", color: "#666" },
  input: { padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
  inputDisabled: { padding: "10px", borderRadius: "6px", border: "1px solid #eee", backgroundColor: "#f9f9f9", color: "#666" },
  inputFull: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" },
  totalBox: { padding: "10px", background: "#fff9fa", border: "1px solid #ffebeb", borderRadius: "6px", fontWeight: "bold", color: "#7b003f" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  th: { padding: "12px", textAlign: "left", borderBottom: "2px solid #eee", fontSize: "12px", color: "#666" },
  td: { padding: "12px", borderBottom: "1px solid #f9f9f9", fontSize: "13px" },
  tr: { transition: "0.2s" },
  btnSave: { background: "#7b003f", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
  btnCancel: { background: "#6c757d", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer" },
  btnEditSmall: { background: "#ffc107", border: "none", padding: "4px 8px", borderRadius: "4px", marginRight: 4, cursor: "pointer" },
  btnDelSmall: { background: "#dc3545", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  searchResult: { position: "absolute", background: "#fff", border: "1px solid #ddd", zIndex: 100, width: "100%", maxHeight: "150px", overflowY: "auto", borderRadius: "6px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" },
  searchItem: { padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "13px" },
  loading: { textAlign: "center", padding: 50 }
};