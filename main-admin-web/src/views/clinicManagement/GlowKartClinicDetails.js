import React, { useState } from "react";
import {  useLocation, useNavigate, useParams } from "react-router-dom";
import {
    CCard,
    CCardBody,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
    CRow,
    CCol,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CImage, CButton,
} from "@coreui/react";
import { COLORS, NGK_COLORS } from "../../Constant/Themes";
import { Download, Eye } from "lucide-react";

// Helper component for consistent black labels
const StrongLabel = ({ children }) => (
    <strong style={{ color: COLORS.black }}>{children}</strong>
);

const ClinicDetails = () => {
    const { clinicId } = useParams();
    const { state: clinic } = useLocation();
    const [activeTab, setActiveTab] = useState(1);
  const navigate = useNavigate()
    // Define tabs with visibility conditions
    const tabs = [
        {
            id: 1,
            name: "General Info",
            visible:
                clinic?.name ||
                clinic?.clinicType ||
                clinic?.primaryContactPerson ||
                clinic?.status ||
                clinic?.subscription ||
                clinic?.hospitalOverallRating ||
                clinic?.recommended !== undefined ||
                clinic?.role ||
                clinic?.username ||
                clinic?.designation,
        },
        {
            id: 2,
            name: "Address & Contact",
            visible:
                clinic?.address ||
                clinic?.city ||
                clinic?.branch ||
                clinic?.contactNumber ||
                clinic?.whatsappNumber ||
                clinic?.email ||
                clinic?.website ||
                clinic?.openingTime ||
                clinic?.closingTime ||
                clinic?.latitude ||
                clinic?.longitude,
        },
        {
            id: 3,
            name: "Documents",
            visible:
                clinic?.businessRegistrationCertificate ||
                clinic?.fireSafetyCertificate ||
                clinic?.hospitalDocuments ||
                clinic?.clinicalEstablishmentCertificate ||
                clinic?.biomedicalWasteManagementAuth ||
                clinic?.gstRegistrationCertificate ||
                clinic?.tradeLicense ||
                clinic?.pharmacistCertificate ||
                clinic?.drugLicenseCertificate ||
                clinic?.contractorDocuments ||
                clinic?.professionalIndemnityInsurance,
        },
        {
            id: 4,
            name: "Bank Details",
            visible:
                clinic?.bankAccountName ||
                clinic?.bankAccountNumber ||
                clinic?.ifscCode ||
                clinic?.upiId,
        },
        {
            id: 5,
            name: "Doctors",
            visible: clinic?.doctorsList?.length > 0,
        },
        {
            id: 6,
            name: "Social Media",
            visible: clinic?.facebookHandle || clinic?.instagramHandle || clinic?.twitterHandle,
        },
        {
            id: 7,
            name: "Others",
            visible:
                clinic?.licenseNumber ||
                clinic?.issuingAuthority ||
                clinic?.hasPharmacist ||
                // clinic?.clinicManagementSoftwareUsage ||
                clinic?.medicinesSoldOnSite ||
                clinic?.panNumber ||
                clinic?.onboardingToken ||
                clinic?.nabhScore ||
                clinic?.walkthrough ||
                clinic?.hospitalLogo ||
                (clinic?.others?.length > 0),
        },
    ];

    const visibleTabs = tabs.filter((tab) => tab.visible);
    if (!visibleTabs.find((t) => t.id === activeTab)) {
        setActiveTab(visibleTabs[0]?.id || 1);
    }

    // Documents list
    const documentsList = [
        { label: "Business Registration", file: clinic?.businessRegistrationCertificate },
        { label: "Fire Safety Certificate", file: clinic?.fireSafetyCertificate },
        { label: "Hospital Documents", file: clinic?.hospitalDocuments },
        { label: "Clinical Establishment Certificate", file: clinic?.clinicalEstablishmentCertificate },
        { label: "Biomedical Waste Management Auth", file: clinic?.biomedicalWasteManagementAuth },
        { label: "GST Certificate", file: clinic?.gstRegistrationCertificate },
        { label: "Trade License", file: clinic?.tradeLicense },
        { label: "Pharmacist Certificate", file: clinic?.pharmacistCertificate },
        { label: "Drug License Certificate", file: clinic?.drugLicenseCertificate },
        { label: "Contractor Documents", file: clinic?.contractorDocuments },
        { label: "Professional Indemnity Insurance", file: clinic?.professionalIndemnityInsurance },
    ].filter(doc => doc.file);

    // Function to view PDF in a new tab
    const viewDocument = (base64Data, filename) => {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length)
            .fill(0)
            .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
    };

    // Helper to render a field if it has data
    const renderField = (label, value) => {
        if (!value && value !== 0) return null;
        return (
            <CCol md={6}>
                <StrongLabel>{label}:</StrongLabel> {value}
            </CCol>
        );
    };

    return (
        <CCard>
            <div className="text-white p-3 d-flex justify-content-between align-items-center rounded"
                style={{ backgroundColor: NGK_COLORS.primary }}>
                <h5 className="mb-1" style={{ color: 'white' }}>{clinic?.name} — Clinic Details</h5>

                <CButton
                    size="sm"
                    style={{
                        background: '#fff',
                        color: NGK_COLORS.primary,
                        border: 'none',
                        fontWeight: '600',
                        borderRadius: '8px',
                        padding: '6px 14px'
                    }}
                    onClick={() => navigate(-1)}
                >
                    Back
                </CButton>
            </div>
            <CCardBody>
                {/* Tabs */}
                <CNav variant="tabs" role="tablist" className="mb-3">
                    {visibleTabs.map((tab) => (
                        <CNavItem key={tab.id}>
                            <CNavLink active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} style={{ cursor: 'pointer' }}>
                                {tab.name}
                            </CNavLink>
                        </CNavItem>
                    ))}
                </CNav>

                <CTabContent>

                    {/* General Info */}
                    {tabs[0].visible && (
                        <CTabPane visible={activeTab === 1}>
                            <CCard className="p-3 shadow-sm">

                                <CRow className="gy-3">
                                    {renderField("Name", clinic?.name)}
                                    {renderField("Clinic Type", clinic?.clinicType)}
                                    {renderField("Primary Contact", clinic?.primaryContactPerson)}
                                    {renderField("Status", clinic?.status)}
                                    {renderField("Subscription", clinic?.subscription)}
                                    {/* {renderField("Rating", clinic?.hospitalOverallRating)} */}
                                    {renderField("Recommended", clinic?.recommended !== undefined ? (clinic.recommended ? "Yes" : "No") : null)}
                                    {renderField("Role", clinic?.role)}
                                    {renderField("Username", clinic?.username)}
                                    {renderField("Designation", clinic?.designation)}
                                </CRow>
                            </CCard>
                        </CTabPane>
                    )}

                    {/* Address & Contact */}
                    {tabs[1].visible && (
                        <CTabPane visible={activeTab === 2}>
                            <CCard className="p-3 shadow-sm">

                                <CRow className="gy-3">
                                    {renderField("Address", clinic?.address)}
                                    {renderField("City", clinic?.city)}
                                    {renderField("Branch", clinic?.branch)}
                                    {renderField("Contact Number", clinic?.contactNumber)}
                                    {renderField("WhatsApp", clinic?.whatsappNumber)}
                                    {renderField("Email", clinic?.email)}
                                    {clinic?.website && (
                                        <CCol md={6}>
                                            <StrongLabel>Website:</StrongLabel>{" "}
                                            <a href={clinic.website} target="_blank" rel="noreferrer">{clinic.website}</a>
                                        </CCol>
                                    )}
                                    {renderField("Opening Time", clinic?.openingTime)}
                                    {renderField("Closing Time", clinic?.closingTime)}
                                    {renderField("Latitude", clinic?.latitude)}
                                    {renderField("Longitude", clinic?.longitude)}
                                </CRow>

                            </CCard>
                        </CTabPane>
                    )}

                    {/* Documents */}
                    {tabs[2].visible && (
                        <CTabPane visible={activeTab === 3}>
                            <CCard className="p-3 shadow-sm">
                                <CCardBody>
                                    <CTable striped hover responsive>
                                        <CTableHead className='pink-table'>
                                            <CTableRow>
                                                <CTableHeaderCell>S.No</CTableHeaderCell>
                                                <CTableHeaderCell>Document Name</CTableHeaderCell>
                                                <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody className='pink-table'>
                                            {documentsList.length > 0 ? documentsList.map((doc, index) => (
                                                <CTableRow key={index}>
                                                    <CTableDataCell>{index + 1}</CTableDataCell>
                                                    <CTableDataCell>{doc.label}</CTableDataCell>
                                                    <CTableDataCell className="text-center">
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() => {
                                                                    const byteCharacters = atob(doc.file);
                                                                    const byteNumbers = new Array(byteCharacters.length)
                                                                        .fill(0)
                                                                        .map((_, i) => byteCharacters.charCodeAt(i));
                                                                    const byteArray = new Uint8Array(byteNumbers);
                                                                    const blob = new Blob([byteArray], { type: "application/pdf" });
                                                                    const link = document.createElement('a');
                                                                    link.href = URL.createObjectURL(blob);
                                                                    link.download = `${doc.label}.pdf`;
                                                                    link.click();
                                                                    URL.revokeObjectURL(link.href);
                                                                }}
                                                                title="Download"
                                                            >
                                                                <Download size={16} />
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-success btn-sm"
                                                                onClick={() => viewDocument(doc.file, doc.label)}
                                                                title="View"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        </div>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            )) : (
                                                <CTableRow>
                                                    <CTableDataCell colSpan={3} className="text-center">No documents uploaded</CTableDataCell>
                                                </CTableRow>
                                            )}
                                        </CTableBody>
                                    </CTable>
                                </CCardBody>
                            </CCard>
                        </CTabPane>
                    )}

                    {/* Bank Details */}
                    {tabs[3].visible && (
                        <CTabPane visible={activeTab === 4}>
                            <CCard className="p-3 shadow-sm">
                                <CRow className="gy-3">
                                    {renderField("Account Holder", clinic?.bankAccountName)}
                                    {renderField("Account Number", clinic?.bankAccountNumber)}
                                    {renderField("IFSC", clinic?.ifscCode)}
                                    {renderField("UPI ID", clinic?.upiId)}
                                </CRow>
                            </CCard>
                        </CTabPane>
                    )}

                    {/* Doctors */}
                    {tabs[4].visible && (
                        <CTabPane visible={activeTab === 5}>
                            <CCard className="p-3 shadow-sm">
                                <CCardBody>
                                    <CTable striped hover responsive>
                                        <CTableHead className='pink-table'>
                                            <CTableRow>
                                                <CTableHeaderCell>#</CTableHeaderCell>
                                                <CTableHeaderCell>Doctor Name</CTableHeaderCell>
                                                <CTableHeaderCell>Registration No</CTableHeaderCell>
                                                <CTableHeaderCell>Specialization</CTableHeaderCell>
                                                <CTableHeaderCell>Association Name</CTableHeaderCell>
                                                <CTableHeaderCell>Association Number</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody className='pink-table'>
                                            {clinic?.doctorsList?.length > 0 ? clinic.doctorsList.map((doc, idx) => (
                                                <CTableRow key={idx}>
                                                    <CTableDataCell>{idx + 1}</CTableDataCell>
                                                    <CTableDataCell>{doc.doctorName}</CTableDataCell>
                                                    <CTableDataCell>{doc.registrationNumber}</CTableDataCell>
                                                    <CTableDataCell>{doc.specialization}</CTableDataCell>
                                                    <CTableDataCell>{doc.associationName}</CTableDataCell>
                                                    <CTableDataCell>{doc.associationNumber}</CTableDataCell>
                                                </CTableRow>
                                            )) : (
                                                <CTableRow>
                                                    <CTableDataCell colSpan={6} className="text-center">No doctors found</CTableDataCell>
                                                </CTableRow>
                                            )}
                                        </CTableBody>
                                    </CTable>
                                </CCardBody>
                            </CCard>
                        </CTabPane>
                    )}

                    {/* Social Media */}
                    {tabs[5].visible && (
                        <CTabPane visible={activeTab === 6}>
                            <CCard className="p-3 shadow-sm">
                                <CRow className="gy-3">
                                    {renderField("Facebook", clinic?.facebookHandle)}
                                    {renderField("Instagram", clinic?.instagramHandle)}
                                    {renderField("Twitter", clinic?.twitterHandle)}
                                </CRow>
                            </CCard>
                        </CTabPane>
                    )}

                    {/* Other Information */}
                    {tabs[6].visible && (
                        <CTabPane visible={activeTab === 7}>
                            <CCard className="p-3 shadow-sm">

                                <CRow className="gy-3">
                                    {renderField("License Number", clinic?.licenseNumber)}
                                    {renderField("Issuing Authority", clinic?.issuingAuthority)}
                                    {renderField("Pharmacist Present", clinic?.hasPharmacist)}
                                    {/* {renderField("Clinic Software", clinic?.clinicManagementSoftwareUsage)} */}
                                    {renderField("Medicines Sold On Site", clinic?.medicinesSoldOnSite)}
                                    {renderField("PAN Number", clinic?.panNumber)}
                                    {renderField("Onboarding Token", clinic?.onboardingToken)}
                                    {renderField("NABH Score", clinic?.nabhScore)}
                                    {renderField("Walkthrough", clinic?.walkthrough)}
                                    {clinic?.hospitalLogo && (
                                        <CCol md={6}>
                                            <StrongLabel>Hospital Logo:</StrongLabel><br />
                                            <CImage src={`data:image/png;base64,${clinic.hospitalLogo}`} width={100} />
                                        </CCol>
                                    )}
                                    {clinic?.others?.length > 0 && (
                                        <>
                                            <h5 className="mt-3" style={{ color: COLORS.black }}>Other Uploaded Files:</h5>
                                            {clinic.others.map((file, idx) => (
                                                <div key={idx} className="mb-2 d-flex align-items-center gap-2">
                                                    <StrongLabel>Document {idx + 1}:</StrongLabel>

                                                    {/* Download Button */}
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => {
                                                            const byteCharacters = atob(file);
                                                            const byteNumbers = new Array(byteCharacters.length)
                                                                .fill(0)
                                                                .map((_, i) => byteCharacters.charCodeAt(i));
                                                            const byteArray = new Uint8Array(byteNumbers);
                                                            const blob = new Blob([byteArray], { type: "application/pdf" });
                                                            const link = document.createElement('a');
                                                            link.href = URL.createObjectURL(blob);
                                                            link.download = `Document_${idx + 1}.pdf`;
                                                            link.click();
                                                            URL.revokeObjectURL(link.href);
                                                        }}
                                                        title="Download"
                                                    >
                                                        <Download size={16} className="me-1" />
                                                    </button>

                                                    {/* View Button */}
                                                    <button
                                                        className="btn btn-outline-success btn-sm"
                                                        onClick={() => viewDocument(file, `Document_${idx + 1}`)}
                                                        title="View"
                                                    >
                                                        <Eye size={16} className="me-1" />
                                                    </button>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </CRow>

                            </CCard>
                        </CTabPane>
                    )}
                </CTabContent>
            </CCardBody>

        </CCard>
    );
};

export default ClinicDetails;
