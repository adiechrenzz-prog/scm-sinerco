import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, update } from "firebase/database";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function ApprovalBarangKeluar() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  // ======================
  // LOAD DATA PENDING
  // ======================
  useEffect(() => {
    return onValue(ref(database, "barangKeluar"), (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, v]) => ({
        id,
        ...v,
      }));
      setData(arr.filter((d) => d.status === "PENDING"));
    });
  }, []);

  // ======================
  // APPROVE
  // ======================
  const approve = (d) => {
    if (!window.confirm("Approve barang keluar ini?")) return;

    // potong stok
    update(ref(database, "items/" + d.itemId), {
      stok: Number(d.stokInventory) - Number(d.stok),
    });

    // update status
    update(ref(database, "barangKeluar/" + d.id), {
      status: "APPROVED",
      approvedBy: auth.currentUser?.email || "admin",
      approvedAt: new Date().toISOString(),
    });
  };

  // ======================
  // REJECT
  // ======================
  const reject = (d) => {
    if (!window.confirm("Reject permintaan ini?")) return;

    update(ref(database, "barangKeluar/" + d.id), {
      status: "REJECTED",
      approvedBy: auth.currentUser?.email || "admin",
      approvedAt: new Date().toISOString(),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>✅ Approval Barang Keluar</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-keluar")}>📤 Barang Keluar</button>
        <button onClick={() => signOut(auth).then(() => navigate("/login"))}>
          Logout
        </button>
      </div>

      <hr />

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Qty</th>
            <th>Satuan</th>
            <th>Tanggal</th>
            <th>Tujuan</th>
            <th>No DO</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan="9" align="center">
                Tidak ada pending approval
              </td>
            </tr>
          )}

          {data.map((d) => (
            <tr key={d.id}>
              <td>{d.partnumber}</td>
              <td>{d.nama}</td>
              <td>{d.stok}</td>
              <td>{d.satuan}</td>
              <td>{d.tanggal}</td>
              <td>{d.tujuan}</td>
              <td>{d.noDO}</td>
              <td>
                <b style={{ color: "orange" }}>PENDING</b>
              </td>
              <td>
                <button
                  style={{ background: "green", color: "white" }}
                  onClick={() => approve(d)}
                >
                  Approve
                </button>{" "}
                <button
                  style={{ background: "red", color: "white" }}
                  onClick={() => reject(d)}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
