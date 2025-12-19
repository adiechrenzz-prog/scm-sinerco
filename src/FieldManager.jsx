import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, push, onValue, remove, set } from "firebase/database";

export default function FieldManager() {
  const [fields, setFields] = useState([]);
  const [name, setName] = useState("");
  const [keyField, setKeyField] = useState("");

  useEffect(() => {
    const r = ref(database, "fields");
    onValue(r, (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, v]) => ({
        id,
        ...v,
      }));
      setFields(arr);
    });
  }, []);

  const addField = async () => {
    if (!keyField || !name) {
      alert("Isi key & nama field");
      return;
    }

    await set(ref(database, "fields/" + keyField), {
      name,
      path: "/inventory"
    });

    setKeyField("");
    setName("");
  };

  const deleteField = async (id) => {
    if (!window.confirm("Hapus field ini?")) return;
    await remove(ref(database, "fields/" + id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Master Field Lokasi</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Key (contoh: jatibarang)"
          value={keyField}
          onChange={(e) => setKeyField(e.target.value.toLowerCase())}
        />
        <input
          placeholder="Nama Field (Jatibarang)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addField}>Tambah Field</button>
      </div>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Key</th>
            <th>Nama</th>
            <th>Path</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.name}</td>
              <td>{f.path}</td>
              <td>
                <button onClick={() => deleteField(f.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
