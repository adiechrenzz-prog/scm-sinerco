import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SOPAudit() {
  const navigate = useNavigate();

  // ID Folder Google Drive
  const folderId = "16rzubeW6OkLu081ukVWK0KBxHlvFve21";

  return (
    <div style={{ 
      padding: '20px', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#f4f7f6', 
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* Header Area */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '20px', 
        gap: '20px' 
      }}>
        {/* Tombol Back */}
        <button 
          onClick={() => navigate(-1)} 
          style={{
            padding: '10px 22px',
            backgroundColor: '#2c3e50', 
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>←</span> KEMBALI
        </button>
        
        {/* JUDUL SUDAH DIGANTI */}
        <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Prosedur SCM</h1>
      </div>
      
      {/* Google Drive Folder Viewer */}
      <div style={{ 
        flex: 1, 
        border: '1px solid #dcdcdc', 
        borderRadius: '10px', 
        overflow: 'hidden', 
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <iframe
          src={`https://drive.google.com/embeddedfolderview?id=${folderId}#list`}
          width="100%"
          height="100%"
          frameBorder="0"
          title="Prosedur SCM Content"
          style={{ border: 'none' }}
        ></iframe>
      </div>

      {/* Footer Info */}
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#7f8c8d', textAlign: 'center' }}>
        Dokumen di atas sinkron otomatis dengan Google Drive Folder.
      </div>
    </div>
  );
}