import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    CCard, CCardBody, CNav, CNavItem, CNavLink,
    CTabContent, CTabPane, CRow, CCol, CTable, CTableHead,
    CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CImage, CButton, CContainer
} from "@coreui/react";
import { Eye, Download, Trash2, Edit } from "lucide-react";
import { updateClinic, deleteClinic } from "../../baseUrl";
import "./ClinicDetails.css";
import { toast } from "react-toastify";
import { getClinicTimings } from "./GlowKartgetTimingsAPI";

/** ⭐ LABEL MAP FOR PRETTY UI */
const LABELS = {
    name: "Name",
    clinicType: "Clinic Type",
    primaryContactPerson: "Primary Contact Person",
    status: "Status",
    subscription: "Subscription",
    recommended: "Recommended",
    role: "Role",
    username: "Username",
    designation: "Designation",
    address: "Address",
    city: "City",
    branch: "Branch",
    contactNumber: "Contact Number",
    whatsappNumber: "WhatsApp Number",
    email: "Email",
    website: "Website",
    openingTime: "Opening Time",
    closingTime: "Closing Time",
    latitude: "Latitude",
    longitude: "Longitude",
    bankAccountName: "Account Holder",
    bankAccountNumber: "Account Number",
    ifscCode: "IFSC Code",
    upiId: "UPI ID",
    facebookHandle: "Facebook",
    instagramHandle: "Instagram",
    twitterHandle: "Twitter",
    licenseNumber: "License Number",
    issuingAuthority: "Issuing Authority",
    hasPharmacist: "Pharmacist Present",
    medicinesSoldOnSite: "Medicines Sold On Site",
    panNumber: "PAN Number",
    //   onboardingToken: "Onboarding Token",
    nabhScore: "NABH Score",
    walkthrough: "Walkthrough",
    clinicSpecializationType: "Specialization Type",
    alternateContactNumber: "Alternate Contact Number",
    drugLicenseFormType: "Drug License Form Type",
    clinicSoftware: "Clinic Software Used?",
    contractorDocuments: "Contractor Documents",
    hospitalDocuments: "Hospital Approval Documents",
    clinicalEstablishmentCertificate: "Clinical Establishment Certificate",
    businessRegistrationCertificate: "Business Registration Certificate",
    biomedicalWasteManagementAuth: "Bio-Medical Waste Auth",
    professionalIndemnityInsurance: "Indemnity Insurance",
    tradeLicense: "Trade License",
    fireSafetyCertificate: "Fire Safety Certificate",
    gstRegistrationCertificate: "GST Certificate",
    pharmacistCertificate: "Pharmacist Certificate",
    drugLicenseCertificate: "Drug License Certificate",

};

/** ⭐ BUTTON GROUP */
const ActionButtons = ({ edit, loading, onEdit, onSave, onCancel, onDelete }) => (
    <div className="button-bottom-container">
        {!edit ? (
            <CButton color="primary" onClick={onEdit}>
                ✏ Edit
            </CButton>
        ) : (
            <>
                <CButton color="success" disabled={loading} onClick={onSave}>
                    {loading ? "Saving..." : "✔ Save"}
                </CButton>
                <CButton color="secondary" disabled={loading} onClick={onCancel}>
                    ✖ Cancel
                </CButton>
                <CButton color="danger" disabled={loading} onClick={onDelete}>
                    🗑 Delete
                </CButton>
            </>
        )}
    </div>
);


const ClinicDetails = () => {
    const { clinicId } = useParams();
    const { state } = useLocation(); // from navigation
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);
    const [editDoctor, setEditDoctor] = useState({ doctorName: "", registrationNumber: "", specialization: "" });
    const [doctorErrors, setDoctorErrors] = useState({});
    const [logoUploaded, setLogoUploaded] = useState(false);
    const [logoUploadStatus, setLogoUploadStatus] = useState("idle");

    const [formData, setFormData] = useState(null);  // ✨ FIXED (No default state)
    const [activeTab, setActiveTab] = useState(1);
    const [editMode, setEditMode] = useState({});
    const [loading, setLoading] = useState(false);
    const [timings, setTimings] = useState([]);
    const [loadingTimings, setLoadingTimings] = useState(false);

    /** ⭐ LOAD DATA WHEN PAGE OPENS OR REFRESHES */
    useEffect(() => {
        if (state) {
            setFormData(state); // coming from previous page
        } else {
            fetchClinicDetails(); // direct page load / refresh
        }
    }, [state]);

    /** 📌 API CALL TO GET CLINIC DATA */
    const fetchClinicDetails = async () => {
        try {
            const res = await fetch(`${GET_CLINIC_DETAILS_API}/${clinicId}`);
            const data = await res.json();
            setFormData(data);
        } catch (error) {
            toast.error("Failed to load clinic data");
        }
    };

    /** 📥 FETCH TIMINGS */
    useEffect(() => {
        const fetchTimings = async () => {
            setLoadingTimings(true);
            const res = await getClinicTimings();
            if (res.success) setTimings(res.data);
            else toast.error("⚠ Unable to load timings");
            setLoadingTimings(false);
        };
        fetchTimings();
    }, []);

    /** ⭐ HANDLERS */
    const changeField = (key, value) => setFormData({ ...formData, [key]: value });

    const saveSection = async (section) => {
        setLoading(true);
        try {
            await updateClinic(clinicId, formData);
            toast.success(` ${section} updated!`);
            setEditMode({});
        } catch {
            toast.error(`❌ Failed to update ${section}`);
        }
        setLoading(false);
    };

    const deleteSection = async (fields) => {
        if (!window.confirm("Are you sure?")) return;
        const updated = { ...formData };
        fields.forEach((f) => (updated[f] = null));
        try {
            await updateClinic(clinicId, updated);
            setFormData(updated);
            toast.success("🗑️ Section deleted!");
        } catch {
            toast.error("❌ Failed to delete section");
        }
    };

    const deleteFile = async (key) => {
        if (!window.confirm("Delete file?")) return;
        try {
            await updateClinic(clinicId, { [key]: null });
            setFormData({ ...formData, [key]: null });
            toast.success("File deleted!");
        } catch {
            toast.error("Delete failed!");
        }
    };

    const replaceFile = (key, file) => {
        if (!file) return;
        const r = new FileReader();

        r.onload = async () => {
            const base64 = r.result.split(",")[1];
            const updated = { ...formData, [key]: base64 };
            await updateClinic(clinicId, updated);
            setFormData(updated);

            setLogoUploaded(true); // ⭐ mark uploaded
            toast.success("✅ Logo uploaded successfully!");
        };

        r.readAsDataURL(file);
    };



    const viewPDF = (data) => {
        const blob = new Blob([Uint8Array.from(atob(data), c => c.charCodeAt(0))], { type: "application/pdf" });
        window.open(URL.createObjectURL(blob), "_blank");
    };

    const tabs = [
        "General Info", "Address & Contact", "Documents",
        "Bank Details", "Doctors", "Social Media", "Others"
    ];

    /** 🕑 WAIT FOR DATA BEFORE RENDER */
    if (!formData) return <div className="text-center p-5">⏳ Loading...</div>;
    const validateDoctor = () => {
        const errors = {};

        if (!editDoctor.doctorName.trim()) {
            errors.doctorName = "Doctor name is required";
        } else if (!/^[A-Za-z\s.]{2,50}$/.test(editDoctor.doctorName)) {
            errors.doctorName = "Only letters & spaces allowed";
        }

        if (!editDoctor.registrationNumber.trim()) {
            errors.registrationNumber = "Registration number required";
        } else if (!/^[A-Za-z0-9-]{3,20}$/.test(editDoctor.registrationNumber)) {
            errors.registrationNumber = "Invalid Reg No (letters/numbers/-)";
        }

        if (!editDoctor.specialization.trim()) {
            errors.specialization = "Specialization is required";
        }
        // ⭐ Clinic Name (Letters, spaces, &, ., -, ')
        if (!formData.name?.trim()) {
            errors.name = "Clinic name is required";
        } else if (!/^[a-zA-Z\s.&'-]{2,100}$/.test(formData.name)) {
            errors.name = "Only letters, spaces, &, ., -, ' allowed (2–100 chars)";
        }

        // ⭐ Primary Contact Person (letters, spaces & dot)
        if (!formData.primaryContactPerson?.trim()) {
            errors.primaryContactPerson = "Primary contact person is required";
        } else if (!/^[A-Za-z\s.]{2,50}$/.test(formData.primaryContactPerson)) {
            errors.primaryContactPerson = "Only letters, spaces & dot (.) allowed";
        }

        // ⭐ Designation (letters, spaces & dot)
        if (!formData.designation?.trim()) {
            errors.designation = "Designation is required";
        } else if (!/^[A-Za-z\s.]{2,50}$/.test(formData.designation)) {
            errors.designation = "Only letters, spaces & dot (.) allowed";
        }
        // ⭐ Address Validation
        if (!formData.address?.trim()) {
            errors.address = "Address with pincode is required";
        } else if (!/\b\d{6}\b/.test(formData.address)) {
            errors.address = "Include a valid 6-digit pincode";
        }

        // ⭐ City (Only letters)
        if (!formData.city?.trim()) {
            errors.city = "City is required";
        } else if (!/^[A-Za-z\s.]{2,50}$/.test(formData.city)) {
            errors.city = "City must contain only letters & dot";
        }

        // ⭐ Branch (Only letters)
        if (!formData.branch?.trim()) {
            errors.branch = "Branch is required";
        } else if (!/^[A-Za-z\s.]{2,50}$/.test(formData.branch)) {
            errors.branch = "Branch must contain only letters & dot";
        }

        // ⭐ Phone Number (10 digits, 5-9 start)
        const phoneRegex = /^[5-9][0-9]{9}$/;

        if (!formData.contactNumber?.trim()) {
            errors.contactNumber = "Contact number is required";
        } else if (!phoneRegex.test(formData.contactNumber)) {
            errors.contactNumber = "Must be 10 digits & start with 5-9";
        }

        if (!formData.whatsappNumber?.trim()) {
            errors.whatsappNumber = "WhatsApp number is required";
        } else if (!phoneRegex.test(formData.whatsappNumber)) {
            errors.whatsappNumber = "Must be 10 digits & start with 5-9";
        }

        // ⭐ Email format
        if (!formData.email?.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Invalid email format";
        }

        // ⭐ Website URL check
        const websiteRegex = /^(http|https):\/\/[^\s]+$/;
        const normalizeWebsite = (v) => v.startsWith("http") ? v : "https://" + v;

        if (!formData.website?.trim()) {
            errors.website = "Website is required";
        } else if (!websiteRegex.test(normalizeWebsite(formData.website.trim()))) {
            errors.website = "Enter valid URL (http:// or https://)";
        }

        // ⭐ Latitude (-90 to 90)
        const lat = parseFloat(formData.latitude);
        if (!formData.latitude) {
            errors.latitude = "Latitude is required";
        } else if (isNaN(lat) || lat < -90 || lat > 90) {
            errors.latitude = "Must be between -90 and 90";
        }

        // ⭐ Longitude (-180 to 180)
        const lng = parseFloat(formData.longitude);
        if (!formData.longitude) {
            errors.longitude = "Longitude is required";
        } else if (isNaN(lng) || lng < -180 || lng > 180) {
            errors.longitude = "Must be between -180 and 180";
        }
        // ⭐ Bank Account Name
        if (!formData.bankAccountName?.trim()) {
            errors.bankAccountName = "Account holder name is required";
        } else if (!/^[A-Za-z\s.]{2,50}$/.test(formData.bankAccountName)) {
            errors.bankAccountName = "Only letters, spaces & dot allowed";
        }

        // ⭐ Bank Account Number
        if (!formData.bankAccountNumber?.trim()) {
            errors.bankAccountNumber = "Bank account number is required";
        } else if (!/^[0-9]{9,18}$/.test(formData.bankAccountNumber)) {
            errors.bankAccountNumber = "Account number must be 9 to 18 digits only";
        }

        // ⭐ IFSC Code
        if (!formData.ifscCode?.trim()) {
            errors.ifscCode = "IFSC Code is required";
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(formData.ifscCode)) {
            errors.ifscCode = "Invalid IFSC format (Ex: SBIN0001234)";
        }

        // ⭐ UPI ID (optional but must be valid if provided)
        if (formData.upiId?.trim() && !/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
            errors.upiId = "Invalid UPI ID format (Ex: ravi@okicici)";
        }

        // ⭐ License Number
        if (!formData.licenseNumber?.trim()) {
            errors.licenseNumber = "License number is required";
        } else if (!/^[A-Za-z0-9/.\-]{3,30}$/.test(formData.licenseNumber)) {
            errors.licenseNumber = "Only letters, numbers, / . - allowed (min 3 chars)";
        }

        // ⭐ Issuing Authority
        if (!formData.issuingAuthority?.trim()) {
            errors.issuingAuthority = "Issuing authority is required";
        } else if (!/^[A-Za-z\s.]{2,50}$/.test(formData.issuingAuthority)) {
            errors.issuingAuthority = "Only letters, spaces & dot allowed";
        }

        // ⭐ Has Pharmacist Yes/No
        if (!formData.hasPharmacist?.trim()) {
            errors.hasPharmacist = "Specify if pharmacist is available (Yes/No)";
        } else if (!/^(Yes|No)$/i.test(formData.hasPharmacist)) {
            errors.hasPharmacist = "Only 'Yes' or 'No' allowed";
        }

        // ⭐ Medicines Sold On Site Yes/No
        if (!formData.medicinesSoldOnSite?.trim()) {
            errors.medicinesSoldOnSite = "Required: Yes or No";
        } else if (!/^(Yes|No)$/i.test(formData.medicinesSoldOnSite)) {
            errors.medicinesSoldOnSite = "Only 'Yes' or 'No' allowed";
        }

        // ⭐ PAN Number
        if (!formData.panNumber?.trim()) {
            errors.panNumber = "PAN Number is required";
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(formData.panNumber)) {
            errors.panNumber = "Invalid PAN format (ABCDE1234F)";
        }

        // ⭐ NABH Score (optional or required)
        if (formData.nabhScore && (isNaN(formData.nabhScore) || formData.nabhScore < 1 || formData.nabhScore > 100)) {
            errors.nabhScore = "NABH score must be between 1 and 100";
        }

        // ⭐ Walkthrough (optional but warn if too short)
        if (formData.walkthrough && formData.walkthrough.length < 3) {
            errors.walkthrough = "Walkthrough info too short";
        }

        setDoctorErrors(errors);
        return Object.keys(errors).length === 0;
    };

    return (
        <CContainer fluid className="py-3">
            <CCard className="shadow-lg">

                {/* ⭐ HEADER */}
                <div div className="text-white p-3 d-flex justify-content-between align-items-center rounded" style={{ background: 'linear-gradient(135deg, var(--color-black), var(--color-bgcolor))' }}>
                    <h5 className="mb-1" style={{ color: 'white' }}>
                        {formData?.name} — Clinic Details
                    </h5>

                    <div className="d-flex gap-2">
                        <CButton color="danger"
                            onClick={() => window.confirm("Delete clinic?") &&
                                deleteClinic(clinicId).then(() => navigate(-1))}
                        >
                            Delete Clinic
                        </CButton>

                        <CButton
                            className="back-button"
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </CButton>
                    </div>
                </div>

                <CCardBody>

                    {/* ⭐ NAVIGATION TABS */}
                    <CNav variant="tabs" className="mb-3">
                        {tabs.map((t, i) => (
                            <CNavItem key={i}>
                                <CNavLink
                                    active={activeTab === i + 1}
                                    onClick={() => setActiveTab(i + 1)}
                                >
                                    {t}
                                </CNavLink>
                            </CNavItem>
                        ))}
                    </CNav>

                    <CTabContent>

                        {/* ⭐ TAB 1 - GENERAL */}
                        <CTabPane visible={activeTab === 1}>
                            <div className="section-card">

                                <CRow>
                                    {[
                                        "name", "clinicType", "primaryContactPerson", "status", "subscription",
                                        "role", "username", "designation"
                                    ].map((key) => (
                                        <CCol md={6} key={key}>
                                            <div className="clinic-field">
                                                <span className="clinic-label">{LABELS[key]}:</span>

                                                {editMode.general ? (
                                                    ["status", "username", "role"].includes(key) ? (
                                                        <input className="form-control" value={formData[key] || ""} disabled />

                                                    ) : key === "clinicType" ? (
                                                        <select
                                                            className={`form-select ${errors[key] ? "is-invalid" : ""}`}
                                                            value={formData.clinicType || ""}
                                                            onChange={(e) => changeField(key, e.target.value)}
                                                        >
                                                            <option value="">Select Clinic Type</option>
                                                            <option value="Proprietorship">Proprietorship</option>
                                                            <option value="Partnership">Partnership</option>
                                                            <option value="LLP">LLP</option>
                                                            <option value="Private Limited">Private Limited</option>
                                                        </select>

                                                    ) : key === "subscription" ? (
                                                        <select
                                                            className={`form-select ${errors[key] ? "is-invalid" : ""}`}
                                                            value={formData.subscription || ""}
                                                            onChange={(e) => changeField(key, e.target.value)}
                                                        >
                                                            <option value="">Select Subscription</option>
                                                            <option value="Free">Free</option>
                                                            <option value="Basic">Basic</option>
                                                            <option value="Standard">Standard</option>
                                                            <option value="Premium">Premium</option>
                                                        </select>

                                                    ) : (
                                                        <input
                                                            className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                                                            value={formData[key] || ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;

                                                                // ⭐ Typing Restrictions
                                                                if (key === "name" && !/^[a-zA-Z\s.&'-]*$/.test(value)) return;
                                                                if (key === "primaryContactPerson" && !/^[A-Za-z\s.]*$/.test(value)) return;
                                                                if (key === "designation" && !/^[A-Za-z\s.]*$/.test(value)) return;

                                                                changeField(key, value);
                                                            }}
                                                        />
                                                    )
                                                ) : (
                                                    <span className="clinic-value">
                                                        {formData[key] || "—"}
                                                    </span>
                                                )}

                                                {/* ⭐ Inline Error Display */}
                                                {errors[key] && <small className="text-danger">{errors[key]}</small>}

                                            </div>
                                        </CCol>
                                    ))}
                                </CRow>

                                <ActionButtons
                                    edit={editMode.general}
                                    loading={loading}
                                    onEdit={() => setEditMode({ general: true })}
                                    onSave={() => saveSection("General")}
                                    onCancel={() => setEditMode({})}
                                    onDelete={() =>
                                        deleteSection([
                                            "name", "clinicType", "primaryContactPerson", "status",
                                            "subscription", "role", "username", "designation"
                                        ])
                                    }
                                />
                            </div>
                        </CTabPane>
                        {/* ⭐ TAB 2 - ADDRESS & CONTACT */}
                        <CTabPane visible={activeTab === 2}>
                            <div className="section-card">
                                <CRow>
                                    {[
                                        "address", "city", "branch", "contactNumber", "whatsappNumber", "email", "website",
                                        "openingTime", "closingTime", "latitude", "longitude"
                                    ].map((key) => (
                                        <CCol md={6} key={key}>
                                            <div className="clinic-field">
                                                <span className="clinic-label">{LABELS[key]}:</span>

                                                {editMode.addr ? (
                                                    key === "openingTime" ? (
                                                        <select
                                                            className={`form-select ${errors[key] ? "is-invalid" : ""}`}
                                                            disabled={loadingTimings}
                                                            value={formData[key] || ""}
                                                            onChange={(e) => changeField(key, e.target.value)}
                                                        >
                                                            <option value="">Select Opening Time</option>
                                                            {timings.map((slot, idx) => (
                                                                <option key={idx} value={slot.openingTime}>{slot.openingTime}</option>
                                                            ))}
                                                        </select>

                                                    ) : key === "closingTime" ? (
                                                        <select
                                                            className={`form-select ${errors[key] ? "is-invalid" : ""}`}
                                                            disabled={loadingTimings}
                                                            value={formData[key] || ""}
                                                            onChange={(e) => changeField(key, e.target.value)}
                                                        >
                                                            <option value="">Select Closing Time</option>
                                                            {timings.map((slot, idx) => (
                                                                <option key={idx} value={slot.closingTime}>{slot.closingTime}</option>
                                                            ))}
                                                        </select>

                                                    ) : (
                                                        <input
                                                            className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                                                            value={formData[key] || ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;

                                                                // ⭐ Typing rules
                                                                if ((key === "city" || key === "branch") && !/^[A-Za-z\s.]*$/.test(value)) return;
                                                                if ((key === "contactNumber" || key === "whatsappNumber") && !/^[0-9]*$/.test(value)) return;
                                                                if ((key === "latitude" || key === "longitude") && !/^-?[0-9.]*$/.test(value)) return;

                                                                changeField(key, value);
                                                            }}
                                                        />
                                                    )
                                                ) : (
                                                    <span className="clinic-value">{formData[key] || "—"}</span>
                                                )}

                                                {errors[key] && <small className="text-danger">{errors[key]}</small>}
                                            </div>
                                        </CCol>
                                    ))}
                                </CRow>

                                <ActionButtons
                                    edit={editMode.addr}
                                    loading={loading}
                                    onEdit={() => setEditMode({ addr: true })}
                                    onSave={() => saveSection("Address & Contact")}
                                    onCancel={() => setEditMode({})}
                                    onDelete={() =>
                                        deleteSection([
                                            "address", "city", "branch", "contactNumber", "whatsappNumber", "email",
                                            "website", "openingTime", "closingTime", "latitude", "longitude"
                                        ])
                                    }
                                />
                            </div>
                        </CTabPane>



                        {/* ⭐ TAB 3 - DOCUMENTS */}
                        <CTabPane visible={activeTab === 3}>
                            <div className="section-card">
                                <CTable bordered responsive>
                                    <CTableHead className="bg-light">
                                        <CTableRow>
                                            <CTableHeaderCell>#</CTableHeaderCell>
                                            <CTableHeaderCell>Document</CTableHeaderCell>
                                            <CTableHeaderCell>Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>

                                    <CTableBody>
                                        {Object.entries(formData)
                                            .filter(([k, v]) =>
                                                typeof v === "string" &&
                                                v?.length > 100 &&
                                                !k.toLowerCase().includes("logo")
                                            )
                                            .map(([key, val], i) => (
                                                <CTableRow key={key}>
                                                    <CTableDataCell>{i + 1}</CTableDataCell>
                                                    <CTableDataCell>{LABELS[key]}</CTableDataCell>
                                                    <CTableDataCell className="d-flex gap-2">

                                                        <CButton color="success" size="sm" onClick={() => viewPDF(val)}>
                                                            <Eye size={15} /> View
                                                        </CButton>

                                                        <CButton
                                                            size="sm"
                                                            onClick={() => {
                                                                const blob = new Blob(
                                                                    [Uint8Array.from(atob(val), (c) => c.charCodeAt(0))],
                                                                    { type: "application/pdf" }
                                                                );
                                                                const a = document.createElement("a");
                                                                a.href = URL.createObjectURL(blob);
                                                                a.download = `${key}.pdf`;
                                                                a.click();
                                                            }}
                                                        >
                                                            <Download size={15} /> Download
                                                        </CButton>

                                                        <CButton color="danger" size="sm" onClick={() => deleteFile(key)}>
                                                            <Trash2 size={15} /> Delete
                                                        </CButton>

                                                        <label className="btn btn-warning btn-sm">
                                                            <Edit size={15} /> Replace
                                                            <input type="file" hidden accept="application/pdf"
                                                                onChange={(e) => replaceFile(key, e.target.files[0])}
                                                            />
                                                        </label>

                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))}
                                    </CTableBody>
                                </CTable>
                            </div>
                        </CTabPane>

                        {/* ⭐ TAB 4 - BANK */}
                        <CTabPane visible={activeTab === 4}>
                            <div className="section-card">
                                <CRow>
                                    {["bankAccountName", "bankAccountNumber", "ifscCode", "upiId"].map((key) => (
                                        <CCol md={6} key={key}>
                                            <div className="clinic-field">
                                                <span className="clinic-label">{LABELS[key]}:</span>

                                                {editMode.bank ? (
                                                    <input
                                                        className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                                                        value={formData[key] || ""}
                                                        onChange={(e) => {
                                                            let value = e.target.value;

                                                            // ⭐ Typing Restrictions
                                                            if (key === "bankAccountName" && !/^[A-Za-z\s.]*$/.test(value)) return;
                                                            if (key === "bankAccountNumber" && !/^[0-9]*$/.test(value)) return;
                                                            if (key === "ifscCode" && !/^[A-Za-z0-9]*$/.test(value)) return;

                                                            changeField(key, value);
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="clinic-value">{formData[key] || "—"}</span>
                                                )}

                                                {/* ⭐ Error Show */}
                                                {errors[key] && <small className="text-danger">{errors[key]}</small>}
                                            </div>
                                        </CCol>
                                    ))}
                                </CRow>

                                <ActionButtons
                                    edit={editMode.bank}
                                    loading={loading}
                                    onEdit={() => setEditMode({ bank: true })}
                                    onSave={() => saveSection("Bank Details")}
                                    onCancel={() => setEditMode({})}
                                    onDelete={() =>
                                        deleteSection(["bankAccountName", "bankAccountNumber", "ifscCode", "upiId"])
                                    }
                                />
                            </div>
                        </CTabPane>


                        {/* ⭐ TAB 5 - DOCTORS */}
                        <CTabPane visible={activeTab === 5}>
                            <div className="section-card">
                                <CTable bordered hover>
                                    <CTableHead className="bg-light">
                                        <CTableRow>
                                            <CTableHeaderCell>#</CTableHeaderCell>
                                            <CTableHeaderCell>Name</CTableHeaderCell>
                                            <CTableHeaderCell>Reg No</CTableHeaderCell>
                                            <CTableHeaderCell>Specialization</CTableHeaderCell>
                                            <CTableHeaderCell>Action</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>

                                    <CTableBody>
                                        {(formData.doctorsList || []).map((doctor, i) => (
                                            <CTableRow key={i}>
                                                <CTableDataCell>{i + 1}</CTableDataCell>

                                                {/* ⭐ IF EDITING SHOW INPUTS ELSE SHOW TEXT */}
                                                {editingIndex === i ? (
                                                    <>
                                                        <CTableDataCell>
                                                            <input
                                                                className={`form-control ${doctorErrors.doctorName ? "is-invalid" : ""}`}
                                                                value={editDoctor.doctorName}
                                                                onChange={(e) =>
                                                                    setEditDoctor({ ...editDoctor, doctorName: e.target.value })
                                                                }
                                                            />
                                                            {doctorErrors.doctorName && <small className="text-danger">{doctorErrors.doctorName}</small>}
                                                        </CTableDataCell>

                                                        <CTableDataCell>
                                                            <input
                                                                className={`form-control ${doctorErrors.registrationNumber ? "is-invalid" : ""}`}
                                                                value={editDoctor.registrationNumber}
                                                                onChange={(e) =>
                                                                    setEditDoctor({ ...editDoctor, registrationNumber: e.target.value })
                                                                }
                                                            />
                                                            {doctorErrors.registrationNumber && <small className="text-danger">{doctorErrors.registrationNumber}</small>}
                                                        </CTableDataCell>

                                                        <CTableDataCell>
                                                            <input
                                                                className={`form-control ${doctorErrors.specialization ? "is-invalid" : ""}`}
                                                                value={editDoctor.specialization}
                                                                onChange={(e) =>
                                                                    setEditDoctor({ ...editDoctor, specialization: e.target.value })
                                                                }
                                                            />
                                                            {doctorErrors.specialization && <small className="text-danger">{doctorErrors.specialization}</small>}
                                                        </CTableDataCell>

                                                        {/* ⭐ Save / Cancel Buttons */}
                                                        <CTableDataCell>
                                                            <CButton
                                                                size="sm"
                                                                color="success"
                                                                onClick={async () => {
                                                                    if (!validateDoctor()) return;

                                                                    const updated = [...formData.doctorsList];
                                                                    updated[i] = editDoctor;

                                                                    await updateClinic(clinicId, { doctorsList: updated });
                                                                    setFormData({ ...formData, doctorsList: updated });
                                                                    setEditingIndex(null);
                                                                    toast.success("✔ Doctor updated");
                                                                }}
                                                            >
                                                                Save
                                                            </CButton>

                                                            <CButton
                                                                size="sm"
                                                                color="secondary"
                                                                className="ms-2"
                                                                onClick={() => setEditingIndex(null)}
                                                            >
                                                                Cancel
                                                            </CButton>
                                                        </CTableDataCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* ⭐ NORMAL VIEW MODE */}
                                                        <CTableDataCell>{doctor.doctorName}</CTableDataCell>
                                                        <CTableDataCell>{doctor.registrationNumber}</CTableDataCell>
                                                        <CTableDataCell>{doctor.specialization}</CTableDataCell>
                                                        <CTableDataCell className="d-flex gap-1">

                                                            {/* EDIT BUTTON */}
                                                            <CButton
                                                                size="sm"
                                                                color="warning"
                                                                onClick={() => {
                                                                    setEditingIndex(i);
                                                                    setEditDoctor(doctor);
                                                                }}
                                                            >
                                                                ✏ Edit
                                                            </CButton>

                                                            {/* DELETE BUTTON */}
                                                            <CButton
                                                                size="sm"
                                                                color="danger"
                                                                onClick={() => {
                                                                    if (!window.confirm("Delete this doctor?")) return;

                                                                    const updated = [...formData.doctorsList];
                                                                    updated.splice(i, 1);
                                                                    updateClinic(clinicId, { doctorsList: updated });
                                                                    setFormData({ ...formData, doctorsList: updated });

                                                                    toast.success("🗑 Doctor removed");
                                                                }}
                                                            >
                                                                🗑 Delete
                                                            </CButton>
                                                        </CTableDataCell>
                                                    </>
                                                )}
                                            </CTableRow>
                                        ))}
                                    </CTableBody>

                                </CTable>
                            </div>
                        </CTabPane>

                        {/* ⭐ TAB 6 - SOCIAL */}
                        <CTabPane visible={activeTab === 6}>
                            <div className="section-card">
                                <CRow>
                                    {["facebookHandle", "instagramHandle", "twitterHandle"].map((key) => (
                                        <CCol md={6} key={key}>
                                            <div className="clinic-field">
                                                <span className="clinic-label">{LABELS[key]}:</span>
                                                {editMode.social ? (
                                                    <input className="form-control"
                                                        value={formData[key] || ""}
                                                        onChange={(e) => changeField(key, e.target.value)}
                                                    />
                                                ) : (
                                                    <span className="clinic-value">{formData[key] || "—"}</span>
                                                )}
                                            </div>
                                        </CCol>
                                    ))}
                                </CRow>

                                <ActionButtons
                                    edit={editMode.social}
                                    loading={loading}
                                    onEdit={() => setEditMode({ social: true })}
                                    onSave={() => saveSection("Social Media")}
                                    onCancel={() => setEditMode({})}
                                    onDelete={() =>
                                        deleteSection(["facebookHandle", "instagramHandle", "twitterHandle"])
                                    }
                                />
                            </div>
                        </CTabPane>

                        {/* ⭐ TAB 7 - OTHERS */}
                        <CTabPane visible={activeTab === 7}>
                            <div className="section-card">
                                <CRow>
                                    {[
                                        "licenseNumber", "issuingAuthority", "hasPharmacist", "medicinesSoldOnSite",
                                        "panNumber", "nabhScore", "walkthrough"
                                    ].map((key) => (
                                        <CCol md={6} key={key}>
                                            <div className="clinic-field">
                                                <span className="clinic-label">{LABELS[key]}:</span>

                                                {editMode.other ? (
                                                    <input
                                                        className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                                                        value={formData[key] || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;

                                                            if (key === "licenseNumber" && !/^[A-Za-z0-9/.\-]*$/.test(value)) return;
                                                            if (key === "issuingAuthority" && !/^[A-Za-z\s.]*$/.test(value)) return;
                                                            if ((key === "hasPharmacist" || key === "medicinesSoldOnSite") && !/^(Yes|No)?$/i.test(value)) return;
                                                            if (key === "panNumber" && !/^[A-Za-z0-9]*$/.test(value)) return;
                                                            if (key === "nabhScore" && !/^[0-9]*$/.test(value)) return;

                                                            changeField(key, value);
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="clinic-value">{formData[key] || "—"}</span>
                                                )}

                                                {errors[key] && <small className="text-danger">{errors[key]}</small>}
                                            </div>
                                        </CCol>
                                    ))}

                                    {/* ⭐ HOSPITAL LOGO SECTION */}
                                    <CCol md={6}>
                                        <div className="clinic-field flex-column">
                                            <span className="clinic-label">Hospital Logo</span>

                                            {formData.hospitalLogo ? (
                                                <>
                                                    <CImage
                                                        width={120}
                                                        className="rounded border mb-2"
                                                        src={`data:image/png;base64,${formData.hospitalLogo}`}
                                                    />

                                                    {editMode.other && (
                                                        <div className="d-flex gap-2 mt-2">

                                                            <CButton
                                                                color="danger"
                                                                size="sm"
                                                                onClick={() => {
                                                                    deleteFile("hospitalLogo");
                                                                    setLogoUploaded(false);
                                                                }}
                                                            >
                                                                🗑 Delete
                                                            </CButton>

                                                            <label className={`btn ${logoUploaded ? "btn-success" : "btn-warning"} btn-sm mt-1`}>
                                                                {logoUploaded ? "✔ Uploaded" : "📤 Upload"}
                                                                <input
                                                                    type="file"
                                                                    hidden
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        if (e.target.files[0]) replaceFile("hospitalLogo", e.target.files[0]);
                                                                    }}
                                                                />
                                                            </label>

                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                editMode.other && (
                                                    <label className={`btn ${logoUploaded ? "btn-success" : "btn-warning"} btn-sm mt-1`}>
                                                        {logoUploaded ? "✔ Uploaded" : "📤 Upload"}
                                                        <input
                                                            type="file"
                                                            hidden
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                if (e.target.files[0]) replaceFile("hospitalLogo", e.target.files[0]);
                                                            }}
                                                        />
                                                    </label>
                                                )
                                            )}
                                        </div>
                                    </CCol>

                                </CRow>

                                <ActionButtons
                                    edit={editMode.other}
                                    loading={loading}
                                    onEdit={() => setEditMode({ other: true })}
                                    onSave={() => saveSection("Others")}
                                    onCancel={() => setEditMode({})}
                                    onDelete={() =>
                                        deleteSection([
                                            "licenseNumber", "issuingAuthority", "hasPharmacist", "medicinesSoldOnSite",
                                            "panNumber", "nabhScore", "walkthrough", "hospitalLogo"
                                        ])
                                    }
                                />
                            </div>
                        </CTabPane>


                    </CTabContent>
                </CCardBody>
            </CCard>
        </CContainer>
    );
};

export default ClinicDetails;
