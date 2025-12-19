import React from "react";
import { useNavigate } from "react-router-dom";

export default function AssetByLocation() {
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: "20px", color: "white" }}>
      <button onClick={() => navigate("/asset-locations")}>← Back</button>
      <h2>Asset By Location List</h2>
      {/* Isi tabel aset Anda */}
    </div>
  );
}