import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import React from "react";

import Login from "./Login";
import DashboardSCMCircle from "./DashboardSCMCircle";
import DashboardJatibarang from "./DashboardJatibarang";
import DashboardJatiasri from "./DashboardJatiasri";
import DashboardTambun from "./DashboardTambun";
import DashboardONWJ from "./DashboardONWJ";
import DashboardSangasanga from "./DashboardSangasanga";
import DashboardTarakan from "./DashboardTarakan";
import DashboardKampar from "./DashboardKampar";
import DashboardLangkap from "./DashboardLangkap";
import DashboardTMB from "./DashboardTMB";
import DashboardLimau from "./DashboardLimau";
import DashboardKemala from "./DashboardKemala";

import ResetDatabase from "./ResetDatabase";
import ProtectedField from "./ProtectedField";

/* --- IMPORT MODUL INVENTORY --- */
import DashboardInventory from "./DashboardInventory/DashboardInventory";
import Inventory from "./DashboardInventory/Inventory";
import BarangMasuk from "./DashboardInventory/BarangMasuk";
import BarangKeluar from "./DashboardInventory/BarangKeluar";
import ApprovalBarangKeluar from "./DashboardInventory/ApprovalBarangKeluar";
import DataPart from "./DashboardInventory/DataPart";
import Supplier from "./DashboardInventory/Supplier";
import Tujuan from "./DashboardInventory/Tujuan";
import DOPrint from "./DashboardInventory/DOPrint";
import FieldManager from "./DashboardInventory/FieldManager";
import StockOpname from "./DashboardInventory/StockOpname";

/* --- IMPORT MODUL STOCK OPNAME --- */
import DashboardStockOpname from "./StockOpname/DashboardStockOpname";
import StockOpnameField from "./StockOpname/StockOpnameField";
import StockOpnameReport from "./StockOpname/StockOpnameReport"; // <-- FIXED PATH
import StockOpnameSchedule from "./StockOpname/StockOpnameSchedule";
import StockOpnameWorkshop from "./StockOpname/StockOpnameWorkshop";
import StockVariance from "./StockOpname/StockVariance";

/* --- IMPORT MODUL FIELD INVENTORY --- */
import FieldInventoryDashboard from "./Field Inventory/FieldInventoryDashboard";
import FieldAssets from "./Field Inventory/FieldAssets";
import FieldCriticalStock from "./Field Inventory/FieldCriticalStock";
import FieldInventoryList from "./Field Inventory/FieldInventory"; 
import FieldMovement from "./Field Inventory/FieldMovement";
import FieldRequest from "./Field Inventory/FieldRequest";
import FieldStockStatus from "./Field Inventory/FieldStock";

/* --- IMPORT MODUL ASSET & LOCATION --- */
import AssetLocationDashboard from "./Asset Location/AssetLocationDashboard";
import AssetByLocation from "./Asset Location/AssetByLocation";
import LocationMaster from "./Asset Location/LocationMaster";

/* --- IMPORT MODUL PREVENTIVE MAINTENANCE (PM) --- */
import DashboardPM from "./DashboardPM/DashboardPM";
import PMUnitList from "./DashboardPM/PMUnitList";
import PMSchedule from "./DashboardPM/PMSchedule";
import PMChecklist from "./DashboardPM/PMChecklist";
import PMReminder from "./DashboardPM/PMReminder";
import PMHistory from "./DashboardPM/PMHistory";

/* --- IMPORT MODUL PSV MANAGEMENT --- */
import DashboardPSV from "./DashboardPSV/DashboardPSV";
import PSVList from "./DashboardPSV/PSVList";
import PSVStatus from "./DashboardPSV/PSVStatus";
import PSVLocation from "./DashboardPSV/PSVLocation";
import PSVSerialNumber from "./DashboardPSV/PSVSerialNumber";
import PSVSetPressure from "./DashboardPSV/PSVSetPressure";
import PSVCertificate from "./DashboardPSV/PSVCertificate";

/* --- IMPORT MODUL INSTRUMEN & KALIBRASI --- */
import DashboardInstrumen from "./Dashboard Instrumen/DashboardInstrumen";
import InstrumentList from "./Dashboard Instrumen/InstrumentList";
import CalibrationCertificate from "./Dashboard Instrumen/CalibrationCertificate";
import CalibrationHistory from "./Dashboard Instrumen/CalibrationHistory";
import CalibrationSchedule from "./Dashboard Instrumen/CalibrationSchedule";
import CalibrationReminder from "./Dashboard Instrumen/CalibrationReminder";

/* --- IMPORT MODUL SASARAN MUTU --- */
import SasaranDashboard from "./SasaranDashboard/SasaranDashboard";
import SasaranFormula from "./SasaranDashboard/SasaranFormula";

/* --- IMPORT MODUL LAINNYA --- */
import OilDashboard from "./Oil Consumption/OilDashboard";
import ProcurementDashboard from "./Procurement/ProcurementDashboard";
import SOPDashboard from "./SOP Dashboard/SOPDashboard"; 
import PanelDashboard from "./Control Panel/PanelDashboard";
import QuarterDashboard from "./Quarter Report/QuarterDashboard";

/* --- KOMPONEN REUSABLE UNTUK VIEWER SOP --- */
const SOPViewerPage = ({ title, folderId }) => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f6', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: '10px 22px', backgroundColor: '#2c3e50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← KEMBALI
        </button>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>{title}</h1>
      </div>
      <div style={{ flex: 1, border: '1px solid #dcdcdc', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <iframe 
          src={`https://drive.google.com/embeddedfolderview?id=${folderId}#list`} 
          width="100%" height="100%" frameBorder="0" title={title}
        ></iframe>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* --- DASHBOARD FIELD --- */}
      <Route path="/dashboard-ho" element={<ProtectedField field="ho"><DashboardSCMCircle /></ProtectedField>} />
      <Route path="/dashboard-jatibarang" element={<ProtectedField field="jatibarang"><DashboardJatibarang /></ProtectedField>} />
      <Route path="/dashboard-jatiasri" element={<ProtectedField field="jatiasri"><DashboardJatiasri /></ProtectedField>} />
      <Route path="/dashboard-tambun" element={<ProtectedField field="tambun"><DashboardTambun /></ProtectedField>} />
      <Route path="/dashboard-onwj" element={<ProtectedField field="onwj"><DashboardONWJ /></ProtectedField>} />
      <Route path="/dashboard-sangasanga" element={<ProtectedField field="sangasanga"><DashboardSangasanga /></ProtectedField>} />
      <Route path="/dashboard-tarakan" element={<ProtectedField field="tarakan"><DashboardTarakan /></ProtectedField>} />
      <Route path="/dashboard-kampar" element={<ProtectedField field="kampar"><DashboardKampar /></ProtectedField>} />
      <Route path="/dashboard-langkap" element={<ProtectedField field="langkap"><DashboardLangkap /></ProtectedField>} />
      <Route path="/dashboard-tmb" element={<ProtectedField field="tmb"><DashboardTMB /></ProtectedField>} />
      <Route path="/dashboard-limau" element={<ProtectedField field="limau"><DashboardLimau /></ProtectedField>} />
      <Route path="/dashboard-kemala" element={<ProtectedField field="kemala"><DashboardKemala /></ProtectedField>} />

      {/* --- MODUL ROUTES --- */}
      <Route path="/dashboard-inventory" element={<ProtectedField><DashboardInventory /></ProtectedField>} />
      <Route path="/inventory" element={<ProtectedField><Inventory /></ProtectedField>} />
      <Route path="/barang-masuk" element={<ProtectedField><BarangMasuk /></ProtectedField>} />
      <Route path="/barang-keluar" element={<ProtectedField><BarangKeluar /></ProtectedField>} />
      <Route path="/approval-barang-keluar" element={<ProtectedField><ApprovalBarangKeluar /></ProtectedField>} />
      <Route path="/data-part" element={<ProtectedField><DataPart /></ProtectedField>} />
      <Route path="/supplier" element={<ProtectedField><Supplier /></ProtectedField>} />
      <Route path="/tujuan" element={<ProtectedField><Tujuan /></ProtectedField>} />
      <Route path="/do-print" element={<ProtectedField><DOPrint /></ProtectedField>} />
      <Route path="/field-manager" element={<ProtectedField field="admin"><FieldManager /></ProtectedField>} />
      <Route path="/stock-opname" element={<ProtectedField><StockOpname /></ProtectedField>} />

      <Route path="/dashboard-stock-opname" element={<ProtectedField><DashboardStockOpname /></ProtectedField>} />
      <Route path="/stock-opname-field" element={<ProtectedField><StockOpnameField /></ProtectedField>} />
      <Route path="/stock-opname-report" element={<ProtectedField><StockOpnameReport /></ProtectedField>} />
      <Route path="/stock-opname-schedule" element={<ProtectedField><StockOpnameSchedule /></ProtectedField>} />
      <Route path="/stock-opname-workshop" element={<ProtectedField><StockOpnameWorkshop /></ProtectedField>} />
      <Route path="/stock-variance" element={<ProtectedField><StockVariance /></ProtectedField>} />

      <Route path="/field-inventory-dashboard" element={<ProtectedField><FieldInventoryDashboard /></ProtectedField>} />
      <Route path="/field-assets" element={<ProtectedField><FieldAssets /></ProtectedField>} />
      <Route path="/field-critical-stock" element={<ProtectedField><FieldCriticalStock /></ProtectedField>} />
      <Route path="/field-inventory-list" element={<ProtectedField><FieldInventoryList /></ProtectedField>} />
      <Route path="/field-movement" element={<ProtectedField><FieldMovement /></ProtectedField>} />
      <Route path="/field-request" element={<ProtectedField><FieldRequest /></ProtectedField>} />
      <Route path="/field-stock-status" element={<ProtectedField><FieldStockStatus /></ProtectedField>} />

      <Route path="/asset-locations-dashboard" element={<ProtectedField><AssetLocationDashboard /></ProtectedField>} />
      <Route path="/asset-by-location" element={<ProtectedField><AssetByLocation /></ProtectedField>} />
      <Route path="/location-master" element={<ProtectedField><LocationMaster /></ProtectedField>} />

      <Route path="/dashboard-pm" element={<ProtectedField><DashboardPM /></ProtectedField>} />
      <Route path="/pm-unit-list" element={<ProtectedField><PMUnitList /></ProtectedField>} />
      <Route path="/pm-schedule" element={<ProtectedField><PMSchedule /></ProtectedField>} />
      <Route path="/pm-checklist" element={<ProtectedField><PMChecklist /></ProtectedField>} />
      <Route path="/pm-reminder" element={<ProtectedField><PMReminder /></ProtectedField>} />
      <Route path="/pm-history" element={<ProtectedField><PMHistory /></ProtectedField>} />

      <Route path="/dashboard-psv" element={<ProtectedField><DashboardPSV /></ProtectedField>} />
      <Route path="/psv-list" element={<ProtectedField><PSVList /></ProtectedField>} />
      <Route path="/psv-status" element={<ProtectedField><PSVStatus /></ProtectedField>} />
      <Route path="/psv-location" element={<ProtectedField><PSVLocation /></ProtectedField>} />
      <Route path="/psv-serial-number" element={<ProtectedField><PSVSerialNumber /></ProtectedField>} />
      <Route path="/psv-set-pressure" element={<ProtectedField><PSVSetPressure /></ProtectedField>} />
      <Route path="/psv-certificate" element={<ProtectedField><PSVCertificate /></ProtectedField>} />

      <Route path="/dashboard-instrumen" element={<ProtectedField><DashboardInstrumen /></ProtectedField>} />
      <Route path="/instrument-list" element={<ProtectedField><InstrumentList /></ProtectedField>} />
      <Route path="/calibration-certificate" element={<ProtectedField><CalibrationCertificate /></ProtectedField>} />
      <Route path="/calibration-history" element={<ProtectedField><CalibrationHistory /></ProtectedField>} />
      <Route path="/calibration-schedule" element={<ProtectedField><CalibrationSchedule /></ProtectedField>} />
      <Route path="/calibration-reminder" element={<ProtectedField><CalibrationReminder /></ProtectedField>} />

      <Route path="/sasaran-dashboard" element={<ProtectedField><SasaranDashboard /></ProtectedField>} />
      <Route path="/sasaran-formula" element={<ProtectedField><SasaranFormula /></ProtectedField>} />

      <Route path="/oil-dashboard" element={<ProtectedField><OilDashboard /></ProtectedField>} />
      <Route path="/procurement-dashboard" element={<ProtectedField><ProcurementDashboard /></ProtectedField>} />
      <Route path="/sop-scm" element={<ProtectedField><SOPDashboard /></ProtectedField>} />
      
      {/* --- ROUTES SEMUA MODUL SOP BARU --- */}
      <Route path="/sop-audit" element={<ProtectedField><SOPViewerPage title="Prosedur SCM" folderId="16rzubeW6OkLu081ukVWK0KBxHlvFve21" /></ProtectedField>} /> 
      <Route path="/sop-file-list" element={<ProtectedField><SOPViewerPage title="Form SCM" folderId="1mSpCnySE58pmosB0t-ypcKWGl3H4QGg0" /></ProtectedField>} /> 
      <Route path="/sop-file-viewer" element={<ProtectedField><SOPViewerPage title="Sasaran Target Program" folderId="1Rl6g8K8KhMJJKt8FJSAFzwwn9gRbSKz6" /></ProtectedField>} /> 
      <Route path="/sop-inventory" element={<ProtectedField><SOPViewerPage title="Identifikasi Isu & Bahaya" folderId="1BLfueBVcF3sRRORQiwuonkZlvKwgl7-P" /></ProtectedField>} /> 
      <Route path="/sop-maintenance" element={<ProtectedField><SOPViewerPage title="Root Cause SCM" folderId="1McU0UuhBjJXGLNs6bckW4_91-AcWIkLb" /></ProtectedField>} /> 
      <Route path="/sop-procurement" element={<ProtectedField><SOPViewerPage title="Audit Inventory SCM" folderId="1ybPy_irUqidaiUZd5mFslVKRpzRu6YrM" /></ProtectedField>} /> 
      <Route path="/sop-scm-detail" element={<ProtectedField><SOPViewerPage title="Audit Stock Opname" folderId="1J17OJXNTp1Xl3pBDQRpiiKneC36ofELB" /></ProtectedField>} /> 

      <Route path="/control-panels" element={<ProtectedField><PanelDashboard /></ProtectedField>} />
      <Route path="/quarter-dashboard" element={<ProtectedField><QuarterDashboard /></ProtectedField>} />
      <Route path="/reset-database" element={<ProtectedField field="admin"><ResetDatabase /></ProtectedField>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}