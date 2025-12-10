import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "SOP_SCM_LIST";

export default function SOPFileList() {
  const navigate = useNavigate();

  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }, [files]);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState(null);

  /* ================= TAMBAH SOP ================= */
  const saveNewSOP = () => {
    if (!newName || !newFile) {
      alert("Nama SOP dan file Word wajib diisi");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result.split(",")[1]; // ✅ SIMPAN BASE64 SAJA

      const newItem = {
        id: `sop-${Date.now()}`,
        name: newName,
        rev: "Rev.00",
        fileName: newFile.name,
        fileBase64: base64,
      };

      setFiles((prev) => [...prev, newItem]);
      setShowAdd(false);
      setNewName("");
      setNewFile(null);
    };

    reader.readAsDataURL(newFile); // ✅ PENTING
  };

  const deleteSOP = (id) => {
    if (!window.confirm("Yakin hapus SOP ini?")) return;
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>📂 List Dokumen SOP SCM</h2>

      {files.length === 0 && <p>📭 Belum ada dokumen SOP</p>}

      {files.map((file) => (
        <div
          key={file.id}
          style={{
            padding: 16,
            marginBottom: 12,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        >
          <div
            onClick={() => navigate(`/SOP-File-List/${file.id}`)}
            style={{ cursor: "pointer" }}
          >
            📄 <b>{file.name}</b>
            <div style={{ fontSize: 12, color: "#666" }}>
              {file.rev} | {file.fileName}
            </div>
          </div>

          <br />
          <button onClick={() => deleteSOP(file.id)}>🗑 Hapus</button>
        </div>
      ))}

      <br />

      {showAdd ? (
        <div>
          <h3>➕ Tambah SOP</h3>

          <input
            placeholder="Nama SOP"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <br /><br />

          <input
            type="file"
            accept=".doc,.docx"
            onChange={(e) => setNewFile(e.target.files[0])}
          />
          <br /><br />

          <button onClick={saveNewSOP}>💾 Save SOP</button>
          <button onClick={() => setShowAdd(false)}>❌ Batal</button>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)}>➕ Tambah SOP</button>
      )}

      <br /><br />

      <button onClick={() => navigate("/sop-scm")}>
        ⬅ Kembali ke Folder SOP
      </button>
    </div>
  );
}
