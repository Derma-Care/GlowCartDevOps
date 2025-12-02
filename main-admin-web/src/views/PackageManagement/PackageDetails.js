import React, { useState, Suspense } from "react";
import {
  CCard,
  CCardBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CButton
} from "@coreui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { NGK_COLORS } from "../../Constant/Themes";

// Lazy-load Service Management component
const ServiceManagement = React.lazy(() =>
  import("../MainProcedureManagement/ProcedureManagement")
);



const PackageDetails = () => {
  const [activeTab, setActiveTab] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();

  // Clinic data received from navigate(..., {state: clinic})
  const clinic = location.state;

  return (
    <CCard>

      {/* ---------- HEADER ---------- */}
      <div
        className="text-white p-3 d-flex justify-content-between align-items-center rounded"
        style={{ backgroundColor: NGK_COLORS.primary }}
      >
        <h5 className="mb-1" style={{ color: 'white' }}>
          {clinic?.name || "Clinic"} — Procedures & Packages
        </h5>

        <CButton
          size="sm"
          style={{
            background: "#fff",
            color: NGK_COLORS.primary,
            border: "none",
            fontWeight: "600",
            borderRadius: "8px",
            padding: "6px 14px",
          }}
          onClick={() => navigate(-1)}
        >
          Back
        </CButton>
      </div>

      <CCardBody>

        {/* ---------- TABS ---------- */}
        <CNav variant="tabs" role="tablist" className="mb-3">

          {/* PROCEDURES TAB */}
          <CNavItem>
            <CNavLink
              active={activeTab === 1}
              onClick={() => setActiveTab(1)}
              style={{ cursor: "pointer" }}
            >
              Procedures
            </CNavLink>
          </CNavItem>

          {/* PACKAGES TAB */}
          <CNavItem>
            <CNavLink
              active={activeTab === 2}
              onClick={() => setActiveTab(2)}
              style={{ cursor: "pointer" }}
            >
              Packages
            </CNavLink>
          </CNavItem>

        </CNav>

        {/* ---------- TAB CONTENT ---------- */}
        <CTabContent className="mt-3">

          {/* ===================== PROCEDURES TAB ========================= */}
          <CTabPane visible={activeTab === 1}>
            <Suspense fallback={<p>Loading Procedures...</p>}>
              <ServiceManagement clinic={clinic} />
            </Suspense>
          </CTabPane>

          {/* ===================== PACKAGES TAB ========================= */}
          <CTabPane visible={activeTab === 2}>
            <h5>All Packages</h5>

            <div className="border rounded p-3">
              <strong>Package List Section</strong>
              <p>This is where you will display packages data.</p>
            </div>
          </CTabPane>

        </CTabContent>

      </CCardBody>

    </CCard>
  );
};

export default PackageDetails;
