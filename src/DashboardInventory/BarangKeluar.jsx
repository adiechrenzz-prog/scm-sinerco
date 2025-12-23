import { useEffect, useState, useRef } from "react";
import { database, auth } from "../firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function BarangKeluar() {
  const navigate = useNavigate();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);
  const [parts, setParts] = useState([]);
  const [pemintaList, setPemintaList] = useState([]);
  const [tujuanList, setTujuanList] = useState([]);

  const [tableFilter, setTableFilter] = useState("");
  const [searchPart, setSearchPart] = useState("");
  const [searchPeminta, setSearchPeminta] = useState(""); 
  const [searchTujuan, setSearchTujuan] = useState("");   
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    partnumber: "", nama: "", jumlah: "", harga: "", total: 0,
    peminta: "", tujuan: "", ket: "", doNumber: "", waktu: ""
  });

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { 
      style: "currency", currency: "IDR", minimumFractionDigits: 0 
    }).format(Number(val) || 0);
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });

    const unsubBK = onValue(ref(database, "barangkeluar"), (snap) => {
      const data = snap.val() || {};
      const arr = Object.keys(data).map((key) => {
        const x = data[key];
        const qty = Number(x.jumlah) || 0;
        const hrg = Number(x.harga) || 0;
        return {
          ...x,
          id: key,
          jumlah: qty,
          harga: hrg,
          total: Number(x.total) > 0 ? Number(x.total) : (qty * hrg),
          doNumber: String(x.doNumber || x.noDO || "TANPA-DO"),
          waktu: String(x.waktu || "-"),
        };
      }).sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
      setItems(arr);
    });

    onValue(ref(database, "datasparepart"), (s) => setParts(Object.values(s.val() || {})));
    onValue(ref(database, "peminta"), (s) => setPemintaList(Object.values(s.val() || {})));
    onValue(ref(database, "tujuan"), (s) => setTujuanList(Object.values(s.val() || {})));
    
    return () => { unsubAuth(); unsubBK(); };
  }, [navigate]);

  if (loadingAuth) return <div style={styles.loading}>Memeriksa Sesi...</div>;

  const handleForm = (e) => {
    const { name, value } = e.target;
    let nf = { ...form, [name]: value };
    if (name === "jumlah" || name === "harga") {
      const q = name === "jumlah" ? value : form.jumlah;
      const h = name === "harga" ? value : form.harga;
      nf.total = Number(q) * Number(h);
    }
    setForm(nf);
  };

  const saveItem = async () => {
    if (!form.partnumber || !form.jumlah || !form.peminta) return alert("Pilih barang, peminta & jumlah!");
    
    const payload = {
      ...form,
      jumlah: Number(form.jumlah),
      harga: Number(form.harga),
      total: Number(form.total),
      waktu: form.waktu || new Date().toISOString().substring(0, 10),
    };

    try {
      if (editId) {
        await update(ref(database, `barangkeluar/${editId}`), payload);
        setEditId(null);
      } else {
        const newKey = push(ref(database, "barangkeluar")).key;
        await set(ref(database, `barangkeluar/${newKey}`), { ...payload, id: newKey });
      }
      setForm({ partnumber: "", nama: "", jumlah: "", harga: "", total: 0, peminta: "", tujuan: "", ket: "", doNumber: "", waktu: "" });
      setSearchPart(""); setSearchPeminta(""); setSearchTujuan("");
      alert("Data berhasil disimpan!");
    } catch (err) { alert("Gagal menyimpan!"); }
  };

  const filteredTable = items.filter(i => 
    String(i.doNumber + i.nama + i.peminta + i.tujuan).toLowerCase().includes(tableFilter.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: "#7b003f" }}>📤 Transaksi Barang Keluar</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

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
          <button style={styles.btnNav} onClick={() => navigate("/barang-masuk")}>📥 Masuk</button>
          <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}} onClick={() => navigate("/barang-keluar")}>📤 Keluar</button>
        </div>

        <div style={styles.navGroup}>
          <span style={styles.navLabel}>LAPORAN</span>
          <button style={styles.btnNav} onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
          <button style={styles.btnNav} onClick={() => navigate("/stock-opname")}>📋 Opname</button>
        </div>
      </div>

      <div style={styles.summaryCard}>
          <div>
              <span style={styles.summaryLabel}>Total Pengeluaran (Terfilter)</span>
              <h1 style={styles.summaryValue}>{formatIDR(filteredTable.reduce((s,a)=>s+a.total, 0))}</h1>
          </div>
          <input 
            style={styles.searchInput} 
            placeholder="Cari No DO / Item / Unit..." 
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
          />
      </div>

      <div style={styles.mainGrid}>
        <div style={{ flex: 1, minWidth: "350px" }}>
          <div style={styles.card}>
            <h4 style={{margin: "0 0 15px 0"}}>{editId ? "📝 Edit Item Keluar" : "🔍 1. Pilih Sparepart"}</h4>
            
            {/* INPUT CARI SPAREPART */}
            <div style={{position: 'relative', marginBottom: 20}}>
                <input 
                  style={styles.inputFull} 
                  placeholder="Ketik nama sparepart..." 
                  value={searchPart} 
                  onChange={(e)=>setSearchPart(e.target.value)} 
                />
                {form.nama && !searchPart && (
                  <div style={{marginTop: 5, fontSize: '12px', color: '#7b003f'}}>
                    Terpilih: <b>{form.partnumber} - {form.nama}</b>
                  </div>
                )}
                {searchPart && (
                  <div style={styles.searchResult}>
                    {parts.filter(p => String(p.nama).toLowerCase().includes(searchPart.toLowerCase())).map(p => (
                      <div key={p.id} style={styles.searchItem} onClick={()=>{
                        setForm({...form, partnumber:p.partnumber, nama:p.nama, harga:p.harga, total:Number(form.jumlah || 0)*Number(p.harga)});
                        setSearchPart("");
                      }}><b>{p.partnumber}</b> - {p.nama}</div>
                    ))}
                  </div>
                )}
            </div>

            <h4 style={{marginTop:25, marginBottom:10}}>👥 2. Peminta & Tujuan</h4>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                {/* INPUT CARI PEMINTA */}
                <div style={{position:'relative'}}>
                    <label style={styles.label}>Peminta</label>
                    <input 
                      style={styles.inputFull} 
                      placeholder="Cari..." 
                      value={searchPeminta || form.peminta} 
                      onChange={(e)=>setSearchPeminta(e.target.value)} 
                    />
                    {searchPeminta && (
                        <div style={styles.searchResult}>
                            {pemintaList.filter(p => String(p.nama).toLowerCase().includes(searchPeminta.toLowerCase())).map(p => (
                                <div key={p.id} style={styles.searchItem} onClick={()=>{
                                    setForm({...form, peminta: p.nama});
                                    setSearchPeminta("");
                                }}>{p.nama}</div>
                            ))}
                        </div>
                    )}
                </div>

                {/* INPUT CARI TUJUAN */}
                <div style={{position:'relative'}}>
                    <label style={styles.label}>Tujuan/Unit</label>
                    <input 
                      style={styles.inputFull} 
                      placeholder="Cari..." 
                      value={searchTujuan || form.tujuan} 
                      onChange={(e)=>setSearchTujuan(e.target.value)} 
                    />
                    {searchTujuan && (
                        <div style={styles.searchResult}>
                            {tujuanList.filter(t => String(t.nama).toLowerCase().includes(searchTujuan.toLowerCase())).map(t => (
                                <div key={t.id} style={styles.searchItem} onClick={()=>{
                                    setForm({...form, tujuan: t.nama});
                                    setSearchTujuan("");
                                }}>{t.nama}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <h4 style={{marginTop:25, marginBottom:10}}>📦 3. Data Transaksi</h4>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>No DO</label>
                  <input name="doNumber" style={styles.input} value={form.doNumber} onChange={handleForm} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Quantity</label>
                  <input name="jumlah" type="number" style={styles.input} value={form.jumlah} onChange={handleForm} />
                </div>
            </div>
            
            <div style={styles.totalBox}>
                <small>Estimasi Nilai Keluar</small><br/>
                {formatIDR(form.total)}
            </div>
            
            <button style={styles.btnSave} onClick={saveItem}>{editId ? "UPDATE TRANSAKSI" : "SIMPAN BARANG KELUAR"}</button>
            {editId && (
              <button style={{...styles.btnSave, background:'#666', marginTop: 10}} onClick={() => { 
                setEditId(null); 
                setForm({partnumber: "", nama: "", jumlah: "", harga: "", total: 0, peminta: "", tujuan: "", ket: "", doNumber: "", waktu: ""});
                setSearchPart(""); setSearchPeminta(""); setSearchTujuan("");
              }}>BATAL</button>
            )}
          </div>
        </div>

        <div style={{ flex: 2, minWidth: "500px" }}>
            <div style={styles.card}>
                <div style={{overflowX: 'auto'}}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={{background:'#f2f2f2'}}>
                                <th style={styles.th}>DO & Item</th>
                                <th style={styles.th}>Peminta / Tujuan</th>
                                <th style={styles.th}>Total</th>
                                <th style={styles.th}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTable.length > 0 ? filteredTable.map(it => (
                                <tr key={it.id}>
                                    <td style={styles.td}><b>{it.doNumber}</b><br/>{it.nama}</td>
                                    <td style={styles.td}>{it.peminta}<br/><small style={{color:'#666'}}>{it.tujuan}</small></td>
                                    <td style={{...styles.td, fontWeight:'bold', color:'#7b003f'}}>{formatIDR(it.total)}</td>
                                    <td style={styles.td}>
                                        <div style={{display:'flex', gap:4}}>
                                            <button style={styles.btnPrintSmall} onClick={() => navigate(`/do-print?noDO=${it.doNumber}`)}>Print</button>
                                            <button style={styles.btnEditSmall} onClick={() => {setEditId(it.id); setForm(it); window.scrollTo(0,0);}}>Edit</button>
                                            <button style={styles.btnDelSmall} onClick={()=>{if(window.confirm("Hapus data ini?")) remove(ref(database, `barangkeluar/${it.id}`))}}>Del</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" style={{textAlign:'center', padding:20}}>Data tidak ditemukan.</td></tr>
                            )}
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
  summaryCard: { background: "#7b003f", color: "white", padding: "20px 30px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
  summaryLabel: { fontSize: "12px", opacity: 0.8 },
  summaryValue: { margin: "5px 0 0 0" },
  searchInput: { padding: "10px", borderRadius: "6px", border: "none", width: "250px", outline: 'none' },
  mainGrid: { display: "flex", gap: "20px", flexWrap: "wrap" },
  card: { background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", marginBottom: 20 },
  inputGroup: { display: "flex", flexDirection: "column", gap: "2px" },
  label: { fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', display: 'block', color: '#666' },
  input: { padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" },
  inputFull: { width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" },
  totalBox: { padding: "15px", background: "#fff9fa", border: "1px solid #ffebeb", borderRadius: "6px", fontWeight: "bold", color: "#7b003f", textAlign:'center', marginTop:15, marginBottom:15 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", borderBottom: "2px solid #eee", fontSize: "12px", color: '#666' },
  td: { padding: "12px", borderBottom: "1px solid #f9f9f9", fontSize: "12px" },
  btnSave: { background: "#7b003f", color: "#fff", border: "none", padding: "15px", borderRadius: "6px", cursor: "pointer", width:'100%', fontWeight:'bold' },
  btnPrintSmall: { background: "#007bff", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize:'11px' },
  btnEditSmall: { background: "#ffc107", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize:'11px' },
  btnDelSmall: { background: "#dc3545", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize:'11px' },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "6px", cursor: "pointer" },
  searchResult: { position: "absolute", background: "#fff", border: "1px solid #ddd", zIndex: 100, width: "100%", maxHeight: "150px", overflowY: "auto", top:'100%', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
  searchItem: { padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize:'13px' },
  loading: { textAlign: "center", padding: 50 }
};