import React from "react";
import { useNavigate } from "react-router-dom";

export default function LocationMaster() { // Gunakan export default
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: "20px", color: "white" }}>
      <button onClick={() => navigate("/asset-locations")}>← Back</button>
      <h2>Location Master</h2>
      {/* Isi konten master lokasi Anda */}
    </div>
  );
}