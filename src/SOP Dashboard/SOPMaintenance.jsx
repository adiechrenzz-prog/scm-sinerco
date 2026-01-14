import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SOPMaintenance() {
  const navigate = useNavigate();
  const folderId = "1McU0UuhBjJXGLNs6bckW4_91-AcWIkLb";

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f6', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 22px', backgroundColor: '#2c3e50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>← KEMBALI</button>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>SOP Maintenance</h1>
      </div>
      <div style={{ flex: 1, border: '1px solid #dcdcdc', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <iframe src={`https://drive.google.com/embeddedfolderview?id=${folderId}#list`} width="100%" height="100%" frameBorder="0" style={{ border: 'none' }}></iframe>
      </div>
    </div>
  );
}