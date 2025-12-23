import { useEffect, useState } from "react";
import { database, auth } from "../firebase";
import { ref, onValue, set, remove, update } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function StockOpname() {
  const navigate = useNavigate();
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [items, setItems] = useState([]); 
  const [search, setSearch] = useState("");
  const [opnameHistory, setOpnameHistory] = useState([]);
  const [editID, setEditID] = useState(null); 
  const [tempOpname, setTempOpname] = useState(""); 

  // ========================= 1. AUTH CHECK =========================
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
    return () => unsubAuth();
  }, [navigate]);

  // ========================= 2. SYNC DATA & CALC STOK =========================
  useEffect(() => {
    const itemsRef = ref(database, "datasparepart");
    const masukRef = ref(database, "barangmasuk");
    const keluarRef = ref(database, "barangkeluar");
    const historyRef = ref(database, "stockopname");

    const unsubData = onValue(itemsRef, (snapInv) => {
      const invData = snapInv.val() || {};
      
      onValue(masukRef, (snapMasuk) => {
        const masukData = snapMasuk.val() || {};
        
        onValue(keluarRef, (snapKeluar) => {
          const keluarData = snapKeluar.val() || {};

          const itemList = Object.keys(invData)
            .map(key => {
              const item = invData[key];
              const pn = String(item.partnumber || "");

              let totalMasuk = 0;
              Object.values(masukData).forEach(m => {
                if(String(m.partnumber) === pn) totalMasuk += Number(m.jumlah || 0);
              });

              let totalKeluar = 0;
              Object.values(keluarData).forEach(k => {
                if(String(k.partnumber) === pn && k.status === "approved") {
                  totalKeluar += Number(k.jumlah || 0);
                }
              });

              const stokSistem = Number(item.stok || 0) + totalMasuk - totalKeluar;
              const harga = Number(item.harga || 0);
              const stokFisik = item.stokFisik !== undefined ? Number(item.stokFisik) : stokSistem;

              return {
                firebaseID: key,
                ...item,
                stokSistem,
                stokFisik,
                harga,
                totalNilai: stokFisik * harga
              };
            })
            .filter(item => item.partnumber && item.nama); 

          setItems(itemList);
        });
      });
    });

    const unsubHistory = onValue(historyRef, (snap) => {
      const data = snap.val() || {};
      setOpnameHistory(Object.keys(data).sort().reverse());
    });

    return () => {
      unsubData();
      unsubHistory();
    };
  }, []);

  // ========================= 3. ACTIONS =========================
  
  const handleSaveRow = async (id) => {
    if (tempOpname === "" || isNaN(tempOpname)) return alert("Masukkan angka valid!");
    try {
      await update(ref(database, `datasparepart/${id}`), {
        stokFisik: Number(tempOpname)
      });
      setEditID(null);
      setTempOpname("");
    } catch (err) {
      alert("Gagal Simpan: " + err.message);
    }
  };

  const archiveOpname = async () => {
    if (items.length === 0) return alert("Data kosong!");
    if (!window.confirm("Arsipkan laporan ini ke riwayat?")) return;

    const now = new Date();
    const folder = now.toISOString().split('T')[0] + "_" + now.getHours() + "-" + now.getMinutes();
    
    const archiveData = {};
    items.forEach((item, idx) => {
      archiveData[idx] = {
        partnumber: item.partnumber,
        nama: item.nama,
        stokSistem: item.stokSistem,
        stokFisik: item.stokFisik,
        harga: item.harga,
        totalNilai: item.totalNilai
      };
    });

    try {
      await set(ref(database, `stockopname/${folder}`), archiveData);
      alert("✅ Laporan Berhasil Diarsipkan!");
    } catch (err) {
      alert("Gagal Arsip.");
    }
  };

  const deleteHistory = (h) => {
    if (window.confirm("Hapus riwayat ini?")) {
      remove(ref(database, `stockopname/${h}`));
    }
  };

  if (loadingAuth) return <div style={styles.loading}>Memuat Data...</div>;

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: "#7b003f" }}>📋 Stock Opname Real-Time</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI LENGKAP (TOMBOL KESEMUA) */}
      <div style={styles.fullNavBar}>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>SISTEM</span>
          <div style={styles.btnRow}>
            <button style={styles.btnNav} onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
            <button style={styles.btnNav} onClick={() => navigate("/inventory")}>📦 Inventory</button>
          </div>
        </div>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>MASTER DATA</span>
          <div style={styles.btnRow}>
            <button style={styles.btnNav} onClick={() => navigate("/datapart")}>🛠 Datapart</button>
            <button style={styles.btnNav} onClick={() => navigate("/supplier")}>🏢 Supplier</button>
          </div>
        </div>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>TRANSAKSI</span>
          <div style={styles.btnRow}>
            <button style={styles.btnNav} onClick={() => navigate("/barang-masuk")}>📥 Masuk</button>
            <button style={styles.btnNav} onClick={() => navigate("/barang-keluar")}>📤 Keluar</button>
          </div>
        </div>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>LAPORAN</span>
          <div style={styles.btnRow}>
            <button style={styles.btnNav} onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
            <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}}>📋 Stock Opname</button>
          </div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={{ flex: 4 }}>
          <div style={styles.card}>
            <div style={{display:'flex', gap:10, marginBottom:15}}>
              <input 
                placeholder="Cari Part Number / Nama..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                style={styles.inputSearch} 
              />
              <button style={styles.btnSaveOpname} onClick={archiveOpname}>💾 Simpan Arsip Laporan</button>
            </div>

            <table style={styles.table}>
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th style={styles.th}>Part Number</th>
                  <th style={styles.th}>Nama Barang</th>
                  <th style={styles.th}>Sistem</th>
                  <th style={{...styles.th, background: '#fff9c4'}}>Fisik</th>
                  <th style={styles.th}>Harga</th>
                  <th style={styles.th}>Total Nilai</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .filter(i => 
                    String(i.partnumber || "").toLowerCase().includes(search.toLowerCase()) || 
                    String(i.nama || "").toLowerCase().includes(search.toLowerCase())
                  )
                  .sort((a, b) => String(a.partnumber).localeCompare(String(b.partnumber)))
                  .map((i) => (
                    <tr key={i.firebaseID}>
                      <td style={styles.td}><b>{i.partnumber}</b></td>
                      <td style={styles.td}>{i.nama}</td>
                      <td style={styles.td}>{i.stokSistem}</td>
                      <td style={{...styles.td, background: '#fffde7'}}>
                        {editID === i.firebaseID ? (
                          <input 
                            type="number" 
                            value={tempOpname} 
                            onChange={(e) => setTempOpname(e.target.value)} 
                            style={styles.inputEdit} 
                            autoFocus 
                          />
                        ) : (
                          <b style={{color: Number(i.stokFisik) !== Number(i.stokSistem) ? 'red' : 'green'}}>
                            {i.stokFisik}
                          </b>
                        )}
                      </td>
                      <td style={styles.td}>Rp {Number(i.harga || 0).toLocaleString()}</td>
                      <td style={styles.td}>Rp {Number(i.totalNilai || 0).toLocaleString()}</td>
                      <td style={styles.td}>
                        {editID === i.firebaseID ? (
                          <button style={styles.btnSaveRow} onClick={() => handleSaveRow(i.firebaseID)}>Simpan</button>
                        ) : (
                          <button style={styles.btnEditRow} onClick={() => { setEditID(i.firebaseID); setTempOpname(i.stokFisik); }}>Edit</button>
                        )}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={styles.card}>
            <h4 style={{marginTop:0}}>🕒 Riwayat</h4>
            <div style={styles.historyList}>
              {opnameHistory.map(h => (
                <div key={h} style={styles.historyItem}>
                  <span style={{fontSize:10}}>{h.replace("_", " ")}</span>
                  <div style={{display:'flex', gap:2}}>
                    <button style={styles.btnView} onClick={() => navigate(`/opname-detail?tanggal=${h}`)}>👁️</button>
                    <button style={styles.btnDel} onClick={() => deleteHistory(h)}>🗑️</button>
                  </div>
                </div>
              ))}
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
  fullNavBar: { 
    display: "flex", 
    gap: "20px", 
    marginBottom: "20px", 
    background: "#fff", 
    padding: "15px", 
    borderRadius: "10px", 
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    flexWrap: "wrap" 
  },
  navGroup: { display: "flex", flexDirection: "column", gap: "5px", borderLeft: "3px solid #7b003f", paddingLeft: "12px" },
  navLabel: { fontSize: "10px", fontWeight: "bold", color: "#7b003f", marginBottom: "2px" },
  btnRow: { display: "flex", gap: "5px" },
  btnNav: { padding: "7px 12px", cursor: "pointer", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px" },
  card: { background: "#fff", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px", textAlign: "left", fontSize: "11px", borderBottom: "2px solid #ddd" },
  td: { padding: "10px", fontSize: "11px", borderBottom: "1px solid #eee" },
  inputSearch: { flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ddd" },
  inputEdit: { width: "60px", padding: "4px", border: "1px solid #7b003f", borderRadius: "4px" },
  btnSaveRow: { background: "#28a745", color: "#fff", border: "none", padding: "5px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" },
  btnEditRow: { background: "#007bff", color: "#fff", border: "none", padding: "5px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" },
  btnSaveOpname: { background: "#7b003f", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" },
  btnDel: { background: "#dc3545", color: "#fff", border: "none", padding: "4px 6px", borderRadius: "4px", cursor: "pointer", fontSize: "10px" },
  btnView: { background: "#6c757d", color: "#fff", border: "none", padding: "4px 6px", borderRadius: "4px", cursor: "pointer", fontSize: "10px" },
  historyItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', alignItems: 'center' },
  historyList: { maxHeight: '450px', overflowY: 'auto' },
  mainGrid: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  loading: { textAlign: 'center', marginTop: 100 }
};