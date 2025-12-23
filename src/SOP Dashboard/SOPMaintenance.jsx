import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SOPMaintenance() {
  const navigate = useNavigate();
  const folderId = "1McU0UuhBjJXGLNs6bckW4_91-AcWIkLb";

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button onClick={() => navigate(-1)} style={buttonStyle}>← KEMBALI</button>
        <h1 style={titleStyle}>SOP Maintenance</h1>
      </div>
      <div style={viewerStyle}>
        <iframe src={`https://drive.google.com/embeddedfolderview?id=${folderId}#list`} width="100%" height="100%" frameBorder="0"></iframe>
      </div>
    </div>
  );
}