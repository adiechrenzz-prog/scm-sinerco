import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";

import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";

export default function OpnameDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const tanggal = params.get("tanggal"); // folder opname
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!tanggal) return;

    const r = ref(database, "stockopname/" + tanggal);
    return onValue(r, (snap) => {
      const data = snap.val() || [];
      setItems(Object.values(data));
    });
  }, [tanggal]);

  if (!tanggal) return <p>Tanggal opname tidak ditemukan.</p>;

  const totalNilai = items.reduce((t, i) => t + Number(i.nilai || 0), 0);

  const exportExcel = () => {
    const rows = items.map((i) => ({
      "Part Number": i.partnumber,
      "Nama Barang": i.nama,
      "Stok Awal": i.stokAwal,
      "Total Masuk": i.masuk,
      "Total Keluar": i.keluar,
      "Sisa Stok": i.sisa,
      "Harga Satuan": i.harga,
      "Total Nilai": i.nilai,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detail Opname");
    XLSX.writeFile(wb, `detail_opname_${tanggal}.xlsx`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 Detail Stock Opname</h2>
      <h3>🕒 Tanggal: {tanggal.replace("_", " ")}</h3>

      <button onClick={() => navigate("/stock-opname")}>⬅ Kembali</button>
      <button onClick={exportExcel} style={{ marginLeft: 10 }}>
        ⬇ Export Excel
      </button>
      <button onClick={() => window.print()} style={{ marginLeft: 10 }}>
        🖨 Print PDF
      </button>

      <hr />

      <h3>Total Nilai Stok: Rp {totalNilai.toLocaleString()}</h3>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Stok Awal</th>
            <th>Masuk</th>
            <th>Keluar</th>
            <th>Sisa</th>
            <th>Harga</th>
            <th>Nilai</th>
          </tr>
        </thead>

        <tbody>
          {items.map((i) => (
            <tr key={i.partnumber}>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.stokAwal}</td>
              <td>{i.masuk}</td>
              <td>{i.keluar}</td>
              <td>{i.sisa}</td>
              <td>{i.harga}</td>
              <td>{Number(i.nilai).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
