import { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";

export default function PMSchedule() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const r = ref(database, "pmSchedule");
    onValue(r, (snap) => {
      const val = snap.val() || {};
      setSchedules(Object.values(val));
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 Maintenance Schedule</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
        <thead>
          <tr style={{ background: "#7b003f", color: "#fff" }}>
            <th style={{ padding: "10px" }}>Unit ID</th>
            <th>Description</th>
            <th>Next Service</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px" }}>{s.unitId}</td>
              <td>{s.desc}</td>
              <td>{s.nextDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}