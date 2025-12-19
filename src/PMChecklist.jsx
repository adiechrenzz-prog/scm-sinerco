import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";

export default function PMChecklist() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const r = ref(database, "pmChecklist");
    onValue(r, (snap) => {
      const val = snap.val() || {};
      setTasks(Object.values(val));
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📋 PM Checklist</h2>
      <div style={{ background: "#fff", padding: "15px", borderRadius: "8px" }}>
        {tasks.map((t, idx) => (
          <div key={idx} style={{ borderBottom: "1px solid #eee", padding: "10px" }}>
            <input type="checkbox" /> <span style={{ marginLeft: "10px" }}>{t.taskName} - {t.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}