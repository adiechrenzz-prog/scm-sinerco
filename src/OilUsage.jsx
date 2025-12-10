import { useState } from "react";

export default function OilUsage() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    date: "",
    location: "",
    oilType: "",
    qty: "",
  });

  const addUsage = () => {
    if (!form.date || !form.location || !form.qty) return;

    setData([...data, { ...form, id: Date.now() }]);
    setForm({ date: "", location: "", oilType: "", qty: "" });
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>🛢 Oil Usage</h2>

      <input
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />
      <input
        placeholder="Lokasi / Unit"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <input
        placeholder="Jenis Oli"
        value={form.oilType}
        onChange={(e) => setForm({ ...form, oilType: e.target.value })}
      />
      <input
        type="number"
        placeholder="Qty (Liter)"
        value={form.qty}
        onChange={(e) => setForm({ ...form, qty: e.target.value })}
      />

      <br /><br />
      <button onClick={addUsage}>➕ Simpan</button>

      <hr />

      {data.map((d) => (
        <div key={d.id}>
          {d.date} | {d.location} | {d.oilType} | {d.qty} L
        </div>
      ))}
    </div>
  );
}
