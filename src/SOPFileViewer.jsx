import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import mammoth from "mammoth";

const STORAGE_KEY = "SOP_SCM_LIST";

/* ===== BASE64 → ARRAYBUFFER ===== */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/* ===== DOWNLOAD WORD ===== */
function downloadWord(base64, fileName) {
  const buffer = base64ToArrayBuffer(base64);
  const blob = new Blob(
    [buffer],
    { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SOPFileViewer() {
  const { docId } = useParams();
  const navigate = useNavigate();

  const [sop, setSop] = useState(null);
  const [html, setHtml] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const list = JSON.parse(saved);
    const found = list.find((i) => i.id === docId);

    if (!found) return;

    setSop(found);

    try {
      const buffer = base64ToArrayBuffer(found.fileBase64);
      mammoth
        .convertToHtml({ arrayBuffer: buffer })
        .then((res) => setHtml(res.value))
        .catch(() => setHtml("<p>❌ Gagal membaca isi dokumen Word</p>"));
    } catch {
      setHtml("<p>❌ File Word rusak / tidak valid</p>");
    }
  }, [docId]);

  if (!sop) {
    return (
      <div style={{ padding: 30 }}>
        <h3>❌ Dokumen tidak ditemukan</h3>
        <button onClick={() => navigate("/SOP-File-List")}>
          ⬅ Kembali
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>📄 {sop.name}</h2>
      <p style={{ color: "#666" }}>{sop.rev}</p>

      <hr />

      {/* ===== ISI SOP ===== */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <br />

      {/* ===== ACTION BUTTON ===== */}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => navigate("/SOP-File-List")}>
          ⬅ Kembali ke List SOP
        </button>

        <button
          onClick={() => downloadWord(sop.fileBase64, sop.fileName)}
          style={{
            background: "#1565c0",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ⬇ Download Word
        </button>

        <button
          onClick={() => window.print()}
          style={{
            background: "#2e7d32",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          🖨 Cetak SOP
        </button>
      </div>
    </div>
  );
}
