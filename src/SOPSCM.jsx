import { useNavigate } from "react-router-dom";

export default function SOPFolder() {
  const navigate = useNavigate();

  // ✅ SATU PINTU KE SOPFileList (SESUI ROUTE)
  const goToSOPFileList = () => {
    navigate("/SOP-File-List");
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>📁 SOP Document Control</h2>
      <p>Folder utama dokumen SOP</p>

      {/* ===== FOLDER SOP SCM ===== */}
      <div
        onClick={goToSOPFileList}
        style={{
          padding: "18px 24px",
          marginBottom: 18,
          width: 360,
          cursor: "pointer",
          border: "2px solid #2e7d32",
          borderRadius: 10,
          background: "#e8f5e9",
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        ✅ SOP SCM
        <div style={{ fontSize: 13, fontWeight: "normal", color: "#2e7d32" }}>
          Klik untuk melihat daftar SOP
        </div>
      </div>

      {/* ===== ACTION BUTTON ===== */}
      <div style={{ display: "flex", gap: 12 }}>
        {/* KE SOPFileList */}
        <button
          type="button"
          onClick={goToSOPFileList}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: 6,
            border: "1px solid #2e7d32",
            background: "#2e7d32",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          📂 Buka List SOP
        </button>

        {/* KE DASHBOARD */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: 6,
            border: "1px solid #aaa",
            background: "#f5f5f5",
          }}
        >
          ⬅ Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
