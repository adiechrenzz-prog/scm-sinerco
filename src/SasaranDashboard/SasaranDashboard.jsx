import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./SasaranDashboard.css";

export default function SasaranDashboard() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT9T832_rSqWGQhF69SaPf4q_VCzf4PNaq9Uj-15zKKxw1quBc9Ize8cUvdkrxvo8KJ11E-lrcwA2ho/pub?gid=0&single=true&output=csv";
  const SPREADSHEET_EDIT_URL = "https://docs.google.com/spreadsheets/d/1WghmyStBxMb0QcvXlSAyr46P5G8pwgydMefEYnRoww0/edit?usp=sharing";

  const [kpiData, setKpiData] = useState(() => {
    const savedData = localStorage.getItem("scm_kpi_data");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [backupData, setBackupData] = useState([]);

  const mapDataToState = useCallback((rawData) => {
    return rawData.map((row, index) => {
      const getVal = (keywords) => {
        const key = Object.keys(row).find(k => 
          keywords.some(word => k.toLowerCase().trim() === word.toLowerCase())
        );
        if (!key) return "";
        const val = row[key];
        return val !== undefined && val !== null ? String(val).trim() : "";
      };

      return {
        id: "kpi-row-" + index,
        no: getVal(["no"]),
        aspek: getVal(["aspek"]),
        point: getVal(["point"]),
        sasaran: getVal(["sasaran mutu"]),
        target: getVal(["target"]),
        track: getVal(["track"]),
        realisasi: months.map(m => getVal([m]))
      };
    }).filter(item => item.sasaran || item.no || item.aspek);
  }, [months]);

  const refreshFromCloud = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${SPREADSHEET_CSV_URL}&t=${new Date().getTime()}`);
      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: 'string', raw: true });
      const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { 
        defval: "",
        raw: false 
      });
      
      const finalData = mapDataToState(rawData);
      if (finalData.length > 0) {
        const currentDataStr = localStorage.getItem("scm_kpi_data");
        const newDataStr = JSON.stringify(finalData);
        if (currentDataStr !== newDataStr) {
          setKpiData(finalData);
          localStorage.setItem("scm_kpi_data", newDataStr);
        }
      }
    } catch (error) {
      console.error("Gagal sinkron:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [mapDataToState, SPREADSHEET_CSV_URL, isLoading]);

  useEffect(() => {
    if (!hasFetched.current) {
      refreshFromCloud();
      hasFetched.current = true;
    }
  }, [refreshFromCloud]);

  const handleCellChange = (id, field, value, index = null) => {
    setKpiData(prev => prev.map(item => {
      if (item.id === id) {
        if (field === "realisasi") {
          const newReal = [...item.realisasi];
          newReal[index] = value;
          return { ...item, realisasi: newReal };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const deleteRow = (id) => {
    if (window.confirm("Hapus baris ini?")) {
      setKpiData(kpiData.filter(item => item.id !== id));
    }
  };

  const startEditing = () => {
    setBackupData(JSON.parse(JSON.stringify(kpiData)));
    setIsEditing(true);
  };

  const saveChanges = () => {
    localStorage.setItem("scm_kpi_data", JSON.stringify(kpiData));
    setIsEditing(false);
    alert("Perubahan berhasil disimpan!");
  };

  const cancelChanges = () => {
    if (window.confirm("Batalkan semua perubahan?")) {
      setKpiData(backupData);
      setIsEditing(false);
    }
  };

  const handleExport = () => {
    const table = document.getElementById("table-to-export");
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, "Sasaran_Mutu_SCM_2025.xlsx");
  };

  return (
    <div className="sasaran-container">
      <div className="sasaran-nav" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f4f4f4', alignItems: 'center' }}>
        <button className="btn-home" onClick={() => navigate("/dashboard-ho")}>← HOME</button>
        
        <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
          {!isEditing ? (
            <>
              {/* TOMBOL EDIT SPREADSHEET BARU */}
              <a href={SPREADSHEET_EDIT_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button style={{ backgroundColor: '#1d6f42', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🌐 Edit Spreadsheet
                </button>
              </a>

              <button onClick={refreshFromCloud} disabled={isLoading} style={{ backgroundColor: "#f1c40f", color: "#333", fontWeight: "bold", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: isLoading ? "wait" : "pointer" }}>
                {isLoading ? "🔄 SEDANG SINKRON..." : "☁️ Sync Cloud"}
              </button>
              
              <button style={{ backgroundColor: '#4a90e2', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }} onClick={() => document.getElementById('import-file').click()}>
                📥 Import Excel
                <input id="import-file" type="file" accept=".xlsx, .xls" hidden onChange={(e) => {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const bstr = evt.target.result;
                    const wb = XLSX.read(bstr, { type: "binary" });
                    const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                    setKpiData(mapDataToState(raw));
                  };
                  reader.readAsBinaryString(file);
                }} />
              </button>
              
              <button onClick={handleExport} style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>📤 Export Excel</button>
              <button onClick={startEditing} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>✏️ Edit Tabel</button>
            </>
          ) : (
            <>
              <button onClick={saveChanges} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Simpan Perubahan</button>
              <button onClick={cancelChanges} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>✖ Batal</button>
            </>
          )}
        </div>
      </div>

      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>SASARAN MUTU SCM 2025</h2>

      <div className="table-responsive" style={{ overflowX: 'auto', padding: '0 10px' }}>
        <table id="table-to-export" className="kpi-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '13px' }}>
          <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <tr>
              <th style={{ border: '1px solid #444', padding: '8px' }}>No</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Aspek</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Point</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Sasaran Mutu</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Target</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Track</th>
              {months.map(m => <th key={m} style={{ border: '1px solid #444', padding: '5px', minWidth: '40px' }}>{m}</th>)}
              {isEditing && <th style={{ border: '1px solid #444', padding: '8px', backgroundColor: '#c0392b' }}>Hapus</th>}
            </tr>
          </thead>
          <tbody>
            {kpiData.map((item) => (
              <tr key={item.id} style={{ backgroundColor: '#fff' }}>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{isEditing ? <input style={{width:'30px'}} value={item.no} onChange={e => handleCellChange(item.id, "no", e.target.value)} /> : item.no}</td>
                <td style={{ border: '1px solid #ddd', padding: '5px' }}>{isEditing ? <input value={item.aspek} onChange={e => handleCellChange(item.id, "aspek", e.target.value)} /> : item.aspek}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{isEditing ? <input style={{width:'30px'}} value={item.point} onChange={e => handleCellChange(item.id, "point", e.target.value)} /> : item.point}</td>
                <td style={{ border: '1px solid #ddd', padding: '5px' }}>{isEditing ? <input style={{width:'100%'}} value={item.sasaran} onChange={e => handleCellChange(item.id, "sasaran", e.target.value)} /> : item.sasaran}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{isEditing ? <input style={{width:'80px'}} value={item.target} onChange={e => handleCellChange(item.id, "target", e.target.value)} /> : item.target}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{isEditing ? <input style={{width:'60px'}} value={item.track} onChange={e => handleCellChange(item.id, "track", e.target.value)} /> : item.track}</td>
                {item.realisasi.map((val, idx) => (
                  <td key={idx} style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                    {isEditing ? <input style={{ width: '30px', textAlign: 'center' }} value={val} onChange={e => handleCellChange(item.id, "realisasi", e.target.value, idx)} /> : val}
                  </td>
                ))}
                {isEditing && (
                  <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                    <button onClick={() => deleteRow(item.id)} style={{ background: '#ffeded', border: '1px solid #ffcccc', cursor: 'pointer', fontSize: '16px', padding: '2px 5px', borderRadius: '4px' }}>🗑️</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}