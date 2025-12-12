import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import DashboardSCMCircle from "./DashboardSCMCircle";
import ResetDatabase from "./ResetDatabase";


/* ================= 1️⃣ INVENTORY ================= */
import Inventory from "./Inventory";
import BarangMasuk from "./BarangMasuk";
import BarangKeluar from "./BarangKeluar";
import ApprovalBarangKeluar from "./ApprovalBarangKeluar";
import SisaStok from "./SisaStok";
import StockOpname from "./StockOpname";
import FieldInventory from "./FieldInventory";
/* ================= MASTER DATA BARU ================= */
import DataPart from "./DataPart";
import Supplier from "./Supplier";
import Peminta from "./Peminta";
import Tujuan from "./Tujuan";
import DOPrint from "./DOPrint";


/* ================= 2️⃣ INSTRUMENT CALIBRATION ================= */
import InstrumentList from "./InstrumentList";
import CalibrationSchedule from "./CalibrationSchedule";
import CalibrationHistory from "./CalibrationHistory";
import CalibrationCertificate from "./CalibrationCertificate";
import CalibrationReminder from "./CalibrationReminder";

/* ================= 3️⃣ PM SERVICE ================= */
import PMUnitList from "./PMUnitList";
import PMSchedule from "./PMSchedule";
import PMHistory from "./PMHistory";
import PMChecklist from "./PMChecklist";
import PMReminder from "./PMReminder";

/* ================= 4️⃣ PSV ASSET REGISTER ================= */
import PSVList from "./PSVList";
import PSVSerialNumber from "./PSVSerialNumber";
import PSVLocation from "./PSVLocation";
import PSVSetPressure from "./PSVSetPressure";
import PSVCertificate from "./PSVCertificate";
import PSVStatus from "./PSVStatus";

/* ================= 5️⃣ ASSET LOCATIONS ================= */
import LocationMaster from "./LocationMaster";
import AssetByLocation from "./AssetByLocation";
import WorkshopAssets from "./WorkshopAssets";
import FieldAssets from "./FieldAssets";

/* ================= 6️⃣ STOCK OPNAME ================= */
import StockOpnameSchedule from "./StockOpnameSchedule";
import StockOpnameWorkshop from "./StockOpnameWorkshop";
import StockOpnameField from "./StockOpnameField";
import StockVariance from "./StockVariance";
import StockOpnameReport from "./StockOpnameReport";
import OpnameDetail from "./OpnameDetail";



/* ================= 7️⃣ OIL CONSUMPTION ================= */
import OilUsage from "./OilUsage";
import OilLocation from "./OilLocation";
import OilPrice from "./OilPrice";
import OilMonthlyRecap from "./OilMonthlyRecap";
import OilAnalysis from "./OilAnalysis";

/* ================= 8️⃣ PROCUREMENT ================= */
import PurchaseRequest from "./PurchaseRequest";
import PurchaseOrder from "./PurchaseOrder";
import GoodsReceiving from "./GoodsReceiving";
import SupplierEvaluation from "./SupplierEvaluation";
import SupplierList from "./SupplierList";


/* --- SOP LAMA / DETAIL --- */
import SOPSCM from "./SOPSCM";
import SOPFileList from "./SOPFileList"
import SOPFileViewer from "./SOPFileViewer"
import SOPInventory from "./SOPInventory";
import SOPProcurement from "./SOPProcurement";
import SOPMaintenance from "./SOPMaintenance";
import SOPAudit from "./SOPAudit";

/* ================= 🔟 CONTROL PANELS ================= */
import PanelMaster from "./PanelMaster";
import PanelLocation from "./PanelLocation";
import PanelSpecification from "./PanelSpecification";
import PanelWiringDiagram from "./PanelWiringDiagram";
import PanelStatus from "./PanelStatus";

/* ================= 1️⃣1️⃣ FIELD INVENTORY ================= */
import FieldStock from "./FieldStock";
import FieldMovement from "./FieldMovement";
import FieldCriticalStock from "./FieldCriticalStock";
import FieldRequest from "./FieldRequest";

/* ================= 1️⃣2️⃣ QUARTER REPORT ================= */
import QuarterInventoryReport from "./QuarterInventoryReport";
import QuarterProcurementReport from "./QuarterProcurementReport";
import QuarterMaintenanceReport from "./QuarterMaintenanceReport";
import QuarterKPIReport from "./QuarterKPIReport";
import QuarterPresentation from "./QuarterPresentation";

/* ================= 1️⃣3️⃣ SCM KPI ================= */
import KPIInventory from "./KPIInventory";
import KPIProcurement from "./KPIProcurement";
import KPIMaintenance from "./KPIMaintenance";
import KPIMonthlyChart from "./KPIMonthlyChart";
import KPITargetActual from "./KPITargetActual";

export default function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* DASHBOARD */}
      <Route path="/dashboard" element={<DashboardSCMCircle />} />

      {/* ===== INVENTORY ===== */}
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/barang-masuk" element={<BarangMasuk />} />
      <Route path="/barang-keluar" element={<BarangKeluar />} />
      <Route path="/approval-barang-keluar" element={<ApprovalBarangKeluar />} />
      <Route path="/sisa-stok" element={<SisaStok />} />
      <Route path="/stock-opname" element={<StockOpname />} />
      <Route path="/field-inventory" element={<FieldInventory />} />
      <Route path="/data-part" element={<DataPart />} />
      <Route path="/do-print" element={<DOPrint />} />

      <Route path="/supplier" element={<Supplier />} />
      <Route path="/peminta" element={<Peminta />} />
      <Route path="/tujuan" element={<Tujuan />} />


      {/* ===== INSTRUMENT CALIBRATION ===== */}
      <Route path="/instrument-list" element={<InstrumentList />} />
      <Route path="/calibration-schedule" element={<CalibrationSchedule />} />
      <Route path="/calibration-history" element={<CalibrationHistory />} />
      <Route path="/calibration-certificate" element={<CalibrationCertificate />} />
      <Route path="/calibration-reminder" element={<CalibrationReminder />} />

      {/* ===== PM SERVICE ===== */}
      <Route path="/pm-unit" element={<PMUnitList />} />
      <Route path="/pm-schedule" element={<PMSchedule />} />
      <Route path="/pm-history" element={<PMHistory />} />
      <Route path="/pm-checklist" element={<PMChecklist />} />
      <Route path="/pm-reminder" element={<PMReminder />} />

      {/* ===== PSV ASSET REGISTER ===== */}
      <Route path="/psv" element={<PSVList />} />
      <Route path="/psv-serial" element={<PSVSerialNumber />} />
      <Route path="/psv-location" element={<PSVLocation />} />
      <Route path="/psv-set-pressure" element={<PSVSetPressure />} />
      <Route path="/psv-certificate" element={<PSVCertificate />} />
      <Route path="/psv-status" element={<PSVStatus />} />

      {/* ===== ASSET LOCATIONS ===== */}
      <Route path="/asset-locations" element={<LocationMaster />} />
      <Route path="/asset-by-location" element={<AssetByLocation />} />
      <Route path="/workshop-assets" element={<WorkshopAssets />} />
      <Route path="/field-assets" element={<FieldAssets />} />

      {/* ===== STOCK OPNAME ===== */}
      <Route path="/stock-opname-schedule" element={<StockOpnameSchedule />} />
      <Route path="/stock-opname-workshop" element={<StockOpnameWorkshop />} />
      <Route path="/stock-opname-field" element={<StockOpnameField />} />
      <Route path="/stock-variance" element={<StockVariance />} />
      <Route path="/stock-opname-report" element={<StockOpnameReport />} />

      {/* ===== OIL CONSUMPTION ===== */}
      <Route path="/oil-usage" element={<OilUsage />} />
      <Route path="/oil-location" element={<OilLocation />} />
      <Route path="/oil-price" element={<OilPrice />} />
      <Route path="/oil-monthly-recap" element={<OilMonthlyRecap />} />
      <Route path="/oil-analysis" element={<OilAnalysis />} />

      {/* ===== PROCUREMENT ===== */}
      <Route path="/purchase-request" element={<PurchaseRequest />} />
      <Route path="/purchase-order" element={<PurchaseOrder />} />
      <Route path="/goods-receiving" element={<GoodsReceiving />} />
      <Route path="/supplier-evaluation" element={<SupplierEvaluation />} />
      <Route path="/supplier-list" element={<SupplierList />} />

      
      {/* ===== SOP DETAIL (LAMA / MANUAL) ===== */}
      <Route path="/sop-scm" element={<SOPSCM />} />
      <Route path="/SOP-File-List" element={<SOPFileList />} />
      <Route path="/SOP-File-List/:docId" element={<SOPFileViewer />}      />
      <Route path="/sop-inventory" element={<SOPInventory />} />
      <Route path="/sop-procurement" element={<SOPProcurement />} />
      <Route path="/sop-maintenance" element={<SOPMaintenance />} />
      <Route path="/sop-audit" element={<SOPAudit />} />

      {/* ===== CONTROL PANELS ===== */}
      <Route path="/control-panels" element={<PanelMaster />} />
      <Route path="/panel-location" element={<PanelLocation />} />
      <Route path="/panel-specification" element={<PanelSpecification />} />
      <Route path="/panel-wiring" element={<PanelWiringDiagram />} />
      <Route path="/panel-status" element={<PanelStatus />} />

      {/* ===== FIELD INVENTORY ===== */}
      <Route path="/field-stock" element={<FieldStock />} />
      <Route path="/field-movement" element={<FieldMovement />} />
      <Route path="/field-critical-stock" element={<FieldCriticalStock />} />
      <Route path="/field-request" element={<FieldRequest />} />

      {/* ===== QUARTER REPORT ===== */}
      <Route path="/quarter-inventory" element={<QuarterInventoryReport />} />
      <Route path="/quarter-procurement" element={<QuarterProcurementReport />} />
      <Route path="/quarter-maintenance" element={<QuarterMaintenanceReport />} />
      <Route path="/quarter-kpi" element={<QuarterKPIReport />} />
      <Route path="/quarter-presentation" element={<QuarterPresentation />} />

      {/* ===== SCM KPI ===== */}
      <Route path="/scm-kpi" element={<KPIInventory />} />
      <Route path="/kpi-inventory" element={<KPIInventory />} />
      <Route path="/kpi-procurement" element={<KPIProcurement />} />
      <Route path="/kpi-maintenance" element={<KPIMaintenance />} />
      <Route path="/kpi-monthly-chart" element={<KPIMonthlyChart />} />
      <Route path="/kpi-target-actual" element={<KPITargetActual />} />
<Route path="/reset-database" element={<ResetDatabase />} />
<Route path="/opname-detail" element={<OpnameDetail />} />



      {/* DEFAULT */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
