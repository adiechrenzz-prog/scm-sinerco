import { useNavigate } from "react-router-dom";
import { ref, remove } from "firebase/database";
import { database } from "./firebase";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function ResetDatabase() {
  const navigate = useNavigate();

  const handleReset = () => {
    const yakin = window.confirm(
      "⚠️ INI AKAN MENGHAPUS SEMUA DATA ITEMS.\n\nLanjutkan?"
    );

    if (!yakin) return;

    remove(ref(database, "items"))
      .then(() => {
        alert("🔥 SEMUA DATA ITEMS TELAH DIHAPUS!");
      })
      .catch((err) => {
        console.error(err);
        alert("❌ ERROR: Tidak bisa menghapus data. Cek console.");
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🗑 RESET DATABASE</h2>

      <p style={{ marginBottom: 20 }}>
        Halaman ini hanya untuk Admin.  
        Klik tombol di bawah untuk menghapus seluruh data <b>items</b>.
      </p>

      <button
        onClick={handleReset}
        style={{
          background: "red",
          color: "white",
          padding: "12px 25px",
          fontSize: 18,
          border: "none",
          cursor: "pointer",
          borderRadius: 8,
        }}
      >
        🔥 HAPUS SEMUA DATA ITEMS
      </button>

      <br /><br />

      <button onClick={() => navigate("/dashboard")}>⬅ Kembali ke Dashboard</button>

      <button
        onClick={() => {
          signOut(auth);
          navigate("/login");
        }}
        style={{ marginLeft: 20 }}
      >
        Logout
      </button>
    </div>
  );
}
