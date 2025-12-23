import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function DOPrint() {
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState([]);
  const [searchDO, setSearchDO] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Link Spreadsheet Barang Keluar (GID 568762200)
  const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRB7U6oyLsL5DcXW5cja8gY60PcTBX0v-KxnR1rRaXM6cJCRAO8JZQ-H9FjTiCRG49m5IHR2dcX8fuB/pub?gid=568762200&single=true&output=csv";

  // =======================
  // LOAD DATA FROM CLOUD
  // =======================
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SPREADSHEET_CSV_URL}&t=${new Date().getTime()}`);
      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: 'string' });
      const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      
      // Mapping agar sesuai dengan kebutuhan DO
      const mapped = rawData.map((row) => {
        const getVal = (keywords) => {
          const key = Object.keys(row).find(k => 
            keywords.some(word => k.toLowerCase().trim() === word.toLowerCase())
          );
          return key ? String(row[key]).trim() : "";
        };

        return {
          idBarang: getVal(["id barang", "id"]),
          namaBarang: getVal(["nama barang"]),
          stok: getVal(["stok", "qty", "jumlah"]),
          satuan: getVal(["satuan"]),
          tanggal: getVal(["tanggal"]),
          doNo: getVal(["do no.", "do number", "nomor do"]),
          gudang: getVal(["gudang"])
        };
      });

      setAllItems(mapped);
    } catch (error) {
      console.error("Gagal mengambil data DO:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =======================
  // FILTER BY NO DO
  // =======================
  useEffect(() => {
    if (!searchDO.trim()) {
      setFiltered([]);
      return;
    }

    const result = allItems.filter(
      (i) => i.doNo && i.doNo.toString().toLowerCase().includes(searchDO.toLowerCase())
    );

    setFiltered(result);
  }, [searchDO, allItems]);

  const printPage = () => window.print();

  return (
    <div className="do-print-container" style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      
      {/* CSS KHUSUS PRINT (Agar navigasi tidak ikut ter-print) */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .do-card { border: none !important; padding: 0 !important; }
            body { background: white; }
          }
          .do-card { border: 1px solid #ccc; padding: 30px; background: white; max-width: 800px; margin: 0 auto; }
        `}
      </style>

      {/* NAV - NO PRINT */}
      <div className="no-print" style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <button onClick={() => navigate("/dashboard-inventory")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/barang-keluar")}>📦 Barang Keluar</button>
        <button onClick={fetchData} disabled={isLoading} style={{backgroundColor: '#f1c40f', border:'none', padding:'5px 10px', borderRadius:'4px'}}>
          {isLoading ? "Syncing..." : "🔄 Refresh Data"}
        </button>
      </div>

      <div className="no-print" style={{ marginBottom: 30 }}>
        <h3>Cari No. Delivery Order (DO)</h3>
        <input
          placeholder="Masukkan No. DO..."
          value={searchDO}
          onChange={(e) => setSearchDO(e.target.value)}
          style={{ padding: 10, width: "100%", maxWidth: 300, fontSize: 16, borderRadius: 5, border: '1px solid #ccc' }}
        />
      </div>

      {/* AREA CETAK DO */}
      {filtered.length > 0 ? (
        <div className="do-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0 }}>DELIVERY ORDER</h1>
              <p style={{ margin: 0, color: '#555' }}>Surat Jalan Barang Keluar</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0 }}><b>No. DO:</b> {filtered[0].doNo}</p>
              <p style={{ margin: 0 }}><b>Tanggal:</b> {filtered[0].tanggal}</p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p><b>Gudang Asal:</b> {filtered[0].gudang || "-"}</p>
          </div>

          <table border="1" width="100%" cellPadding="10" style={{ borderCollapse: 'collapse', marginBottom: 30 }}>
            <thead style={{ backgroundColor: '#f2f2f2' }}>
              <tr>
                <th>ID Barang</th>
                <th>Nama Barang</th>
                <th width="100">Jumlah</th>
                <th width="100">Satuan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={idx}>
                  <td align="center">{item.idBarang}</td>
                  <td>{item.namaBarang}</td>
                  <td align="center"><b>{item.stok}</b></td>
                  <td align="center">{item.satuan}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 50 }}>
            <div style={{ textAlign: 'center', width: 200 }}>
              <p>Penerima,</p>
              <br /><br /><br />
              <p>( __________________ )</p>
            </div>
            <div style={{ textAlign: 'center', width: 200 }}>
              <p>Hormat Kami,</p>
              <br /><br /><br />
              <p>( __________________ )</p>
            </div>
          </div>

          <div className="no-print" style={{ marginTop: 40, textAlign: 'center' }}>
            <button onClick={printPage} style={{ padding: "12px 30px", fontSize: 18, backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
              🖨 Cetak Sekarang
            </button>
          </div>
        </div>
      ) : (
        searchDO && !isLoading && <p style={{ color: "red", textAlign: 'center' }}>❌ Data DO Tidak Ditemukan</p>
      )}
    </div>
  );
}