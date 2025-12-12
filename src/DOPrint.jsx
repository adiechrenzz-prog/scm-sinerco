import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function DOPrint() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);

  const [allItems, setAllItems] = useState([]);
  const [searchDO, setSearchDO] = useState("");

  const [filtered, setFiltered] = useState([]);

  // =======================
  // AUTH
  // =======================
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // =======================
  // LOAD BARANG KELUAR
  // =======================
  useEffect(() => {
    const r = ref(database, "barangkeluar");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setAllItems(Object.values(data));
    });
  }, []);

  // =======================
  // FILTER BY NO. DO
  // =======================
  useEffect(() => {
    if (!searchDO.trim()) {
      setFiltered([]);
      return;
    }

    const result = allItems.filter(
      (i) => i.noDO && i.noDO.toString().toLowerCase() === searchDO.toLowerCase()
    );

    setFiltered(result);
  }, [searchDO, allItems]);

  if (loadingAuth) return <p>Checking login…</p>;

  // =======================
  // TOTAL HARGA DO
  // =======================
  const totalHargaDO = filtered.reduce(
    (t, a) => t + Number(a.totalHarga || 0),
    0
  );

  // =======================
  // PRINT
  // =======================
  const printPage = () => window.print();

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Print Delivery Order (DO)</h2>

      {/* NAVIGATION */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>

        <button
          onClick={() => {
            signOut(auth);
            navigate("/login");
          }}
          style={{ marginLeft: "auto" }}
        >
          Logout
        </button>
      </div>

      <hr />

      <h3>Cari Berdasarkan No. DO</h3>

      <input
        placeholder="Masukkan No. DO"
        value={searchDO}
        onChange={(e) => setSearchDO(e.target.value)}
        style={{
          padding: 5,
          width: "250px",
          fontSize: 16,
        }}
      />

      {filtered.length > 0 && (
        <>
          <hr />

          {/* HEADER DO */}
          <div style={{ marginBottom: 20 }}>
            <h3>📄 Delivery Order</h3>
            <p><b>No. DO:</b> {searchDO}</p>
            <p><b>Tanggal:</b> {filtered[0]?.waktu || "-"}</p>
            <p><b>Peminta:</b> {filtered[0]?.peminta || "-"}</p>
            <p><b>Tujuan:</b> {filtered[0]?.tujuan || "-"}</p>
          </div>

          {/* TABLE */}
          <table border="1" width="100%" cellPadding="6">
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Nama Barang</th>
                <th>Jumlah</th>
                <th>Harga Satuan</th>
                <th>Total Harga</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((i) => (
                <tr key={i.id}>
                  <td>{i.partnumber}</td>
                  <td>{i.nama}</td>
                  <td>{i.jumlah}</td>
                  <td>{i.harga}</td>
                  <td>{i.totalHarga}</td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: "right", fontWeight: "bold" }}>
                  Total Pengeluaran:
                </td>
                <td style={{ fontWeight: "bold" }}>
                  Rp {totalHargaDO.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          <br />

          <button
            onClick={printPage}
            style={{
              padding: "6px 12px",
              fontSize: 16,
            }}
          >
            🖨 Print DO
          </button>
        </>
      )}

      {searchDO && filtered.length === 0 && (
        <p style={{ color: "red" }}>❌ Tidak ada data dengan No. DO tersebut</p>
      )}
    </div>
  );
}
