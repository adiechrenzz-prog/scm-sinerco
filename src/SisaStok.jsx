import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function SisaStok() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [barangMasuk, setBarangMasuk] = useState([]);
  const [barangKeluar, setBarangKeluar] = useState([]);

  const [search, setSearch] = useState("");

  // ============================
  // AUTH
  // ============================
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // ============================
  // LOAD INVENTORY
  // ============================
  useEffect(() => {
    onValue(ref(database, "items"), (snap) => {
      const data = snap.val() || {};
      setInventory(Object.values(data));
    });
  }, []);

  // ============================
  // LOAD BARANG MASUK
  // ============================
  useEffect(() => {
    onValue(ref(database, "barangmasuk"), (snap) => {
      const data = snap.val() || {};
      setBarangMasuk(Object.values(data));
    });
  }, []);

  // ============================
  // LOAD BARANG KELUAR APPROVED (AMAN)
  // ============================
  useEffect(() => {
    onValue(ref(database, "barangkeluar"), (snap) => {
      const data = snap.val() || {};
      const arr = Object.values(data).filter((i) => i.status === "approved");
      setBarangKeluar(arr);
    });
  }, []);

  if (loadingAuth) return <p>Checking login…</p>;

  // ============================
  // HITUNG SISA STOK — AMAN
  // ============================
  const map = {};

  const safePN = (pn) => String(pn || "").trim();

  // INVENTORY
  inventory.forEach((i) => {
    const pn = safePN(i.partnumber);
    if (!pn) return;

    if (!map[pn]) {
      map[pn] = {
        partnumber: pn,
        nama: i.nama || "",
        harga: Number(i.harga || 0),
        stokAwal: Number(i.stok || 0),
        masuk: 0,
        keluar: 0,
      };
    }
  });

  // BARANG MASUK
  barangMasuk.forEach((bm) => {
    const pn = safePN(bm.partnumber);
    if (!pn) return;

    if (!map[pn]) {
      map[pn] = {
        partnumber: pn,
        nama: bm.nama || "",
        harga: 0,
        stokAwal: 0,
        masuk: 0,
        keluar: 0,
      };
    }

    map[pn].masuk += Number(bm.jumlah || bm.Jumlah || 0);
  });

  // BARANG KELUAR APPROVED
  barangKeluar.forEach((bk) => {
    const pn = safePN(bk.partnumber);
    if (!pn) return;

    if (!map[pn]) {
      map[pn] = {
        partnumber: pn,
        nama: bk.nama || "",
        harga: 0,
        stokAwal: 0,
        masuk: 0,
        keluar: 0,
      };
    }

    map[pn].keluar += Number(bk.jumlah || bk.Jumlah || 0);
  });

  // FINAL RESULT
  const result = Object.values(map).map((i) => {
    const sisa = i.stokAwal + i.masuk - i.keluar;
    return {
      ...i,
      sisa,
      nilai: sisa * Number(i.harga || 0),
    };
  });

  result.sort((a, b) => a.partnumber.localeCompare(b.partnumber));

  // SEARCH
  const filtered = result.filter(
    (i) =>
      i.partnumber.toLowerCase().includes(search.toLowerCase()) ||
      i.nama.toLowerCase().includes(search.toLowerCase())
  );

  const totalNilai = filtered.reduce((sum, i) => sum + i.nilai, 0);

  // ============================
  // EXPORT EXCEL
  // ============================
  const exportExcel = () => {
    const data = filtered.map((i) => ({
      "Part Number": i.partnumber,
      "Nama Barang": i.nama,
      "Stok Awal": i.stokAwal,
      "Total Masuk": i.masuk,
      "Total Keluar": i.keluar,
      "Sisa Stok": i.sisa,
      "Harga Satuan": i.harga,
      "Total Nilai": i.nilai,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sisa Stok");
    XLSX.writeFile(wb, "sisa_stok.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Laporan Sisa Stok</h2>

      {/* NAV BAR */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/approval-barang-keluar")}>📝 Approval</button>
        <button onClick={() => navigate("/stock-opname")}>📋 Stock Opname</button>

        <button onClick={exportExcel}>⬇ Export Excel</button>

        <button style={{ marginLeft: "auto" }} onClick={() => { signOut(auth); navigate("/login"); }}>
          Logout
        </button>
      </div>

      <hr />

      <input
        placeholder="Cari Part Number / Nama Barang"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "40%", marginBottom: 10 }}
      />

      <h3>💰 Total Nilai Stok: Rp {totalNilai.toLocaleString()}</h3>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Stok Awal</th>
            <th>Total Masuk</th>
            <th>Total Keluar</th>
            <th>Sisa Stok</th>
            <th>Harga</th>
            <th>Nilai</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((i) => (
            <tr key={i.partnumber}>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.stokAwal}</td>
              <td>{i.masuk}</td>
              <td>{i.keluar}</td>
              <td style={{
                background: i.sisa <= 0 ? "#ffcccc" : "",
                fontWeight: i.sisa <= 0 ? "bold" : "",
              }}>
                {i.sisa}
              </td>
              <td>{i.harga}</td>
              <td>{i.nilai.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
