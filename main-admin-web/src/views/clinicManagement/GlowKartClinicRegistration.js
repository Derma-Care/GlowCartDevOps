import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import FileInput from './FileInput'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormFeedback,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CTooltip,
  CFormCheck,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
} from '@coreui/react'
import { AllClinicData, BASE_URL, BASE_URL_API, CLINIC_REGISTRATION_URL, ClinicAllData, getAllQuestions, postAllQuestionsAndAnswers } from '../../baseUrl'
import { CategoryData } from '../categoryManagement/CategoryAPI'
import sendDermaCareOnboardingEmail from '../../Utils/Emailjs'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getClinicTimings } from './GlowKartgetTimingsAPI'
import ClinicOnboardingSuccess from './SuccessOnboradClinic'
import { colors } from '@mui/material'
import { COLORS, NGK_COLORS } from '../../Constant/Themes'
import { Edit2, Trash2 } from 'lucide-react'
import { ConfirmationModal } from '../../Utils/ConfirmationDelete'

const ClinicRegistration = () => {

  // -------------------- REFS --------------------
  const refs = {
    hospitalLogo: useRef(),
    hospitalDocuments: useRef(),
    contractorDocuments: useRef(),
    clinicalEstablishmentCertificate: useRef(),
    businessRegistrationCertificate: useRef(),
    pharmacistCertificate: useRef(),
    biomedicalWasteManagementAuth: useRef(),
    fireSafetyCertificate: useRef(),
    professionalIndemnityInsurance: useRef(),
    gstRegistrationCertificate: useRef(),
    drugLicenseCertificate: useRef(),
    tradeLicense: useRef(),
  };

  const navigate = useNavigate();
  const savedQuestionId = localStorage.getItem("savedQuestionId");

  // -------------------- STATE --------------------
  const [errors, setErrors] = useState({});
  const [timings, setTimings] = useState([]);
  const [loadingTimings, setLoadingTimings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedOption, setSelectedOption] = useState('');
  const [selectedPharmacistOption, setSelectedPharmacistOption] = useState('');

  const [doctorsList, setDoctorsList] = useState([]);
  const [editDoctorIndex, setEditDoctorIndex] = useState(null);

  const [nabhQuestions, setNabhQuestions] = useState([]);
  const [nabhAnswers, setNabhAnswers] = useState([]);
  const [nabhScore, setNabhScore] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    contactNumber: '',
    whatsappNumber: '',
    openingTime: '',
    closingTime: '',
    hospitalLogo: null,
    email: '',
    website: '',
    licenseNumber: '',
    issuingAuthority: '',

    hospitalDocuments: [],
    contractorDocuments: [],
    clinicalEstablishmentCertificate: [],
    businessRegistrationCertificate: [],

    drugLicenseCertificate: [],
    drugLicenseFormType: "",
    pharmacistCertificate: [],
    biomedicalWasteManagementAuth: [],
    tradeLicense: [],
    fireSafetyCertificate: [],
    professionalIndemnityInsurance: [],
    gstRegistrationCertificate: [],
    others: [],

    clinicType: '',
    subscription: '',
    latitude: "",
    longitude: "",

    clinicSpecializationType: '',
    primaryContactPerson: '',
    designation: '',
    alternateContactNumber: '',

    bankAccountName: '',
    bankAccountNumber: '',
    ifscCode: '',
    upiId: '',
    panNumber: '',

    branch: '',
    doctorsList: [],
    nabhScore: null
  });

  const [doctorEntry, setDoctorEntry] = useState({
    doctorName: "",
    specialization: "",
    registrationNumber: "",
    associationNumber: "",
    associationName: ""
  });

  // -------------------- EFFECTS --------------------
  useEffect(() => {
    const fetchTimings = async () => {
      setLoadingTimings(true);
      const res = await getClinicTimings();
      res.success ? setTimings(res.data) : toast.error(res.message);
      setLoadingTimings(false);
    };
    fetchTimings();
  }, []);

  useEffect(() => {
    setFormData(prev => ({ ...prev, doctorsList }));
  }, [doctorsList]);

  // -------------------- HELPERS --------------------
  const normalizeWebsite = (url) =>
    /^https?:\/\//i.test(url) ? url : `https://${url}`;

  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const convertFiles = async (files) => {
    if (!Array.isArray(files)) return [];
    return Promise.all(
      files.map(async f => {
        if (f?.base64) return f.base64;
        if (f instanceof Blob) return await convertFileToBase64(f);
        return f || "";
      })
    );
  };

  // -------------------- DOCTOR --------------------
  const handleDoctorChange = (e) => {
    const { name, value } = e.target;
    setDoctorEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDoctor = () => {
    if (Object.values(doctorEntry).some(v => !v)) {
      return setErrors(prev => ({ ...prev, doctorsList: "Fill all doctor fields" }));
    }

    if (editDoctorIndex !== null) {
      const updated = [...doctorsList];
      updated[editDoctorIndex] = doctorEntry;
      setDoctorsList(updated);
      setEditDoctorIndex(null);
    } else {
      setDoctorsList(prev => [...prev, doctorEntry]);
    }

    setDoctorEntry({
      doctorName: "", specialization: "",
      registrationNumber: "", associationNumber: "", associationName: ""
    });
  };

  // -------------------- VALIDATION --------------------
  const validateForm = () => {
    const err = {};
    const phoneRegex = /^[5-9]\d{9}$/;

    if (!formData.name?.trim()) err.name = "Clinic name required";
    if (!formData.address?.match(/\b\d{6}\b/)) err.address = "Valid pincode required";
    if (!formData.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) err.email = "Invalid email";

    if (!phoneRegex.test(formData.contactNumber)) err.contactNumber = "Invalid phone";
    if (!phoneRegex.test(formData.whatsappNumber)) err.whatsappNumber = "Invalid WhatsApp";

    if (!formData.openingTime || !formData.closingTime)
      err.time = "Opening & closing required";

    if (!formData.hospitalLogo) err.hospitalLogo = "Logo required";

    if (!formData.website?.trim()) err.website = "Website required";

    if (!formData.latitude || !formData.longitude)
      err.location = "Lat & Long required";

    if (!doctorsList.length)
      err.doctorsList = "Add at least one doctor";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // -------------------- INPUT --------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // -------------------- FILE --------------------
  const handleAppendFiles = async (e, field) => {
    const files = Array.from(e.target.files || []);
    const base64Files = await Promise.all(
      files.map(async file => ({
        name: file.name,
        base64: await convertFileToBase64(file)
      }))
    );

    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), ...base64Files]
    }));
  };

  // -------------------- SUBMIT --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        website: normalizeWebsite(formData.website),
        hospitalLogo: await convertFileToBase64(formData.hospitalLogo),

        hospitalDocuments: await convertFiles(formData.hospitalDocuments),
        contractorDocuments: await convertFiles(formData.contractorDocuments),
        clinicalEstablishmentCertificate: await convertFiles(formData.clinicalEstablishmentCertificate),
        businessRegistrationCertificate: await convertFiles(formData.businessRegistrationCertificate),
        drugLicenseCertificate: await convertFiles(formData.drugLicenseCertificate),
        pharmacistCertificate: await convertFiles(formData.pharmacistCertificate),
        biomedicalWasteManagementAuth: await convertFiles(formData.biomedicalWasteManagementAuth),
        tradeLicense: await convertFiles(formData.tradeLicense),
        fireSafetyCertificate: await convertFiles(formData.fireSafetyCertificate),
        professionalIndemnityInsurance: await convertFiles(formData.professionalIndemnityInsurance),
        gstRegistrationCertificate: await convertFiles(formData.gstRegistrationCertificate),
      };

      const res = await axios.post(CLINIC_REGISTRATION_URL, payload);

      if (res.data?.success) {
        navigate("/clinic-onboarding-success", {
          state: {
            clinicName: formData.name,
            clinicId: res.data.data?.clinicId,
          }
        });
      } else {
        toast.error(res.data?.message);
      }

    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <CCard className="shadow-sm border-0 rounded-3">
        <CCardHeader className="text-center" style={{ backgroundColor: NGK_COLORS.primary, color: COLORS.white }}>
          <h3 className="mb-0">Clinic Registration</h3>
        </CCardHeader>

        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <h5 className="mb-3 mt-6" style={{ color: 'var(--color-black)' }}>
              Clinic Information
            </h5>
            <CRow className="mb-4 g-3">
              <CCol md={4}>
                <CFormLabel>
                  Clinic Name
                  <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));

                    const error =
                      !value.trim()
                        ? "Clinic name is required"
                        : value.length < 2
                          ? "Clinic name must be at least 2 characters"
                          : value.length > 100
                            ? "Clinic name cannot exceed 100 characters"
                            : "";

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.name}
                />

                {errors.name && <CFormFeedback invalid>{errors.name}</CFormFeedback>}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Email Address<span style={{ color: 'red' }}>*</span>
                </CFormLabel>

                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  style={{
                    backgroundColor: "#e9ecef",   // light gray like Bootstrap
                    color: "#6c757d",             // gray text
                  }}
                  readOnly={true}   // ⬅️ Make field non-editable
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));
                    setErrors((prev) => ({ ...prev, [name]: '' }));
                  }}
                  invalid={!!errors.email}
                />


                {errors.email && (
                  <CFormFeedback invalid>{errors.email}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Contact Number<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    handleInputChange({ target: { name: 'contactNumber', value } });
                  }}
                  maxLength={10}
                  invalid={!!errors.contactNumber}
                />
                {errors.contactNumber && (
                  <CFormFeedback invalid>{errors.contactNumber}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>
                  Website<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={(e) => {
                    const { name, value } = e.target;

                    // Update form data
                    setFormData((prev) => ({ ...prev, [name]: value }));

                    // Real-time validation
                    let error = '';
                    if (!value.trim()) {
                      error = 'Website is required';
                    } else if (!/^https?:\/\/[^\s]+$/.test(value.trim())) {
                      error = 'Website must start with http:// or https:// and contain no spaces';
                    }

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.website}
                />
                {errors.website && (
                  <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.website}</div>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Clinic Specialization Type <span style={{ color: 'red' }}>*</span>
                </CFormLabel>

                <CFormSelect
                  name="clinicSpecializationType"
                  value={formData.clinicSpecializationType || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));

                    const error = !value.trim()
                      ? "Clinic Specialization Type is required"
                      : "";

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.clinicSpecializationType}
                >
                  <option value="">Select Clinic Type</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Aesthetic">Aesthetic</option>
                  <option value="Cosmetology">Cosmetology</option>
                  <option value="Multi-specialty">Multi-specialty</option>
                </CFormSelect>

                {errors.clinicSpecializationType && (
                  <CFormFeedback invalid>{errors.clinicSpecializationType}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Designation <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="designation"
                  value={formData.designation || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));

                    const error = !value.trim()
                      ? "Designation is required"
                      : "";

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.designation}
                />
                {errors.designation && (
                  <CFormFeedback invalid>{errors.designation}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>
                  Do you use any Clinic Management Software?
                </CFormLabel>
                <CFormSelect
                  name="clinicSoftware"
                  value={formData.clinicSoftware}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clinicSoftware: e.target.value === 'true',
                    }))
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </CFormSelect>

              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Recommendation Status
                  {/* <span className="text-danger">*</span> */}
                </CFormLabel>
                <CFormSelect
                  name="recommended"
                  value={formData.recommended}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recommended: e.target.value === 'true',
                    }))
                  }
                >
                  <option value="true">Yes, Recommend</option>
                  <option value="false">No, Don't Recommend</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Clinic Type <span style={{ color: 'red' }}>*</span>
                </CFormLabel>

                <CFormSelect
                  name="clinicType"
                  value={formData.clinicType}
                  onChange={(e) => {
                    const value = e.target.value;

                    setFormData((prev) => ({ ...prev, clinicType: value }));

                    setErrors((prev) => ({
                      ...prev,
                      clinicType: value ? "" : "Please select a clinic type.",
                    }));
                  }}
                  invalid={!!errors.clinicType}
                >
                  <option value="">Select Type</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLP">LLP</option>
                  <option value="Private Limited">Private Limited</option>
                </CFormSelect>

                {errors.clinicType && (
                  <CFormFeedback invalid>{errors.clinicType}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>
                  WhatsAppNumber <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    handleInputChange({ target: { name: 'whatsappNumber', value } });
                  }}
                  maxLength={10}
                  invalid={!!errors.whatsappNumber}
                />
                {errors.whatsappNumber && (
                  <CFormFeedback invalid>{errors.whatsappNumber}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <h5 className="mb-3 mt-6" style={{ color: NGK_COLORS.primary }}>Clinic Contact Details</h5>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Primary Contact Person
                  <span style={{ color: 'red' }}>*</span>
                </CFormLabel>

                <CFormInput
                  type="text"
                  name="primaryContactPerson"
                  value={formData.primaryContactPerson || ""}
                  maxLength={50} // optional, limit name length
                  onChange={(e) => {
                    let { name, value } = e.target;

                    // Remove digits and special characters (allow letters and spaces)
                    value = value.replace(/[^a-zA-Z\s]/g, '');

                    setFormData((prev) => ({ ...prev, [name]: value }));

                    // Validation
                    let error = "";
                    if (!value.trim()) {
                      error = "Name is required";
                    }

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.primaryContactPerson}

                />

                {errors.primaryContactPerson && (
                  <CFormFeedback invalid>{errors.primaryContactPerson}</CFormFeedback>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Alternate Contact Number</CFormLabel>

                <CFormInput
                  type="text" // keep as text for better control
                  name="alternateContactNumber"
                  value={formData.alternateContactNumber || ""}
                  maxLength={10} // restrict input to 10 digits
                  onChange={(e) => {
                    let { name, value } = e.target;

                    // remove non-numeric characters
                    value = value.replace(/\D/g, '');

                    // restrict to 10 digits
                    if (value.length > 10) value = value.slice(0, 10);

                    setFormData((prev) => ({ ...prev, [name]: value }));

                    let error = "";
                    if (value && !/^[6-9][0-9]{9}$/.test(value)) {
                      error = "Enter a valid 10-digit mobile number starting with 6-9";
                    }

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.alternateContactNumber}
                />

                {errors.alternateContactNumber && (
                  <CFormFeedback invalid>{errors.alternateContactNumber}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Address<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  invalid={!!errors.address}
                />
                {errors.address && <CFormFeedback invalid>{errors.address}</CFormFeedback>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  City<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onKeyDown={preventNumberInput}
                  invalid={!!errors.city}
                />
                {errors.city && <CFormFeedback invalid>{errors.city}</CFormFeedback>}
              </CCol>
            </CRow>

            <h5 className="mb-3 mt-6" style={{ color: NGK_COLORS.primary }}>Bank & Financial Information</h5>
            <CRow className='mb-3'>
              <CCol md={4}>
                <CFormLabel>
                  Bank Account Name <span style={{ color: 'red' }}>*</span>
                </CFormLabel>

                <CFormInput
                  type="text"
                  name="bankAccountName"
                  value={formData.bankAccountName || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;

                    // Remove numbers and special characters
                    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');

                    setFormData((prev) => ({ ...prev, [name]: lettersOnly }));

                    let error = "";
                    if (!lettersOnly.trim()) {
                      error = "Bank Account Name is required";
                    } else if (lettersOnly.length < 2) {
                      error = "Must be at least 2 characters";
                    } else if (lettersOnly.length > 50) {
                      error = "Cannot exceed 50 characters";
                    }

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.bankAccountName}
                />

                {errors.bankAccountName && (
                  <CFormFeedback invalid>{errors.bankAccountName}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Bank Account Number <span style={{ color: 'red' }}>*</span>
                </CFormLabel>

                <CFormInput
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber || ""}
                  maxLength={18} // maximum digits
                  onChange={(e) => {
                    let { name, value } = e.target;
                    // Remove non-numeric characters
                    value = value.replace(/\D/g, '');
                    // Optional: restrict to 18 digits max
                    if (value.length > 18) value = value.slice(0, 18);
                    setFormData((prev) => ({ ...prev, [name]: value }));
                    let error = "";
                    if (!value.trim()) {
                      error = "Bank Account Number is required";
                    } else if (value.length < 9) {
                      error = "Bank Account Number must be at least 9 digits";
                    }

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.bankAccountNumber}
                />

                {errors.bankAccountNumber && (
                  <CFormFeedback invalid>{errors.bankAccountNumber}</CFormFeedback>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  IFSC Code <span style={{ color: 'red' }}>*</span>
                </CFormLabel>

                <CFormInput
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode || ""}
                  maxLength={11} // IFSC is always 11 characters
                  onChange={(e) => {
                    let { name, value } = e.target;
                    // Convert input to uppercase automatically
                    value = value.toUpperCase();
                    setFormData((prev) => ({ ...prev, [name]: value }));
                    // Validation
                    let error = "";
                    if (!value.trim()) {
                      error = "IFSC Code is required";
                    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
                      error = "Invalid IFSC Code";
                    }
                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.ifscCode}
                />
                {errors.ifscCode && <CFormFeedback invalid>{errors.ifscCode}</CFormFeedback>}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>UPI ID</CFormLabel>
                <CFormInput
                  type="text"
                  name="upiId"
                  value={formData.upiId || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));
                  }}
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel>
                  PAN Number <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="panNumber"
                  value={formData.panNumber || ""}
                  maxLength={10}
                  onChange={(e) => {
                    let { name, value } = e.target;

                    // ✅ Convert to uppercase automatically
                    value = value.toUpperCase();

                    // ✅ Optional: remove spaces
                    value = value.replace(/\s/g, '');

                    setFormData((prev) => ({ ...prev, [name]: value }));

                    const error =
                      !value.trim()
                        ? "PAN Number is required"
                        : !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)
                          ? "Invalid PAN format (Ex: ABCDE1234F)"
                          : "";

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  invalid={!!errors.panNumber}
                />

                {errors.panNumber && (
                  <CFormFeedback invalid>{errors.panNumber}</CFormFeedback>
                )}
              </CCol>
            </CRow>

            <h5 className="mb-4 fw-bold" style={{ color: NGK_COLORS.primary }}>Clinic Operations</h5>

            {/* Row 1 : Clinic Management Software + Subscription */}
            <CRow className="mb-4">
              <CCol md={6}>
                <CFormLabel>
                  Subscription <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormSelect
                  name="subscription"
                  value={formData.subscription}
                  onChange={handleInputChange}
                  invalid={!!errors.subscription}
                >
                  <option value="">Select Subscription</option>
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </CFormSelect>
                {errors.subscription && (
                  <p className="text-danger small">{errors.subscription}</p>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Medicines sold on-site</CFormLabel>
                <CFormSelect
                  name="medicinesSoldOnSite"
                  value={formData.medicinesSoldOnSite}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      medicinesSoldOnSite: e.target.value === "true",
                      ...(e.target.value === "false" && {
                        drugLicenseCertificate: null,
                        drugLicenseFormType: "",
                      }),
                    }))
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </CFormSelect>
              </CCol>
            </CRow>
            {/* Row 3 : Drug License (conditional) */}
            {formData.medicinesSoldOnSite && (
              <CRow className="mb-4">
                <CCol md={6}>
                  <FileInput
                    label="Drug License Certificate"
                    name="drugLicenseCertificate"
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    inputRef={refs.drugLicenseCertificate}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Drug License Form Type (20/21)</CFormLabel>
                  <CFormSelect
                    name="drugLicenseFormType"
                    value={formData.drugLicenseFormType || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        drugLicenseFormType: e.target.value,
                      }))
                    }
                    ref={refs.drugLicenseFormType}
                  >
                    <option value="">Select Form Type</option>
                    <option value="Form 20">Form 20</option>
                    <option value="Form 21">Form 21</option>
                  </CFormSelect>
                  {errors.drugLicenseFormType && (
                    <p className="text-danger small">{errors.drugLicenseFormType}</p>
                  )}
                </CCol>
              </CRow>
            )}

            {/* Row 4 : Opening + Closing Time */}
            <CRow className="mb-4">
              <CCol md={6}>
                <CFormLabel>
                  Opening Time <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormSelect
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleInputChange}
                  invalid={!!errors.openingTime}
                  disabled={loadingTimings}
                >
                  <option value="">Select Opening Time</option>
                  {timings.map((slot, idx) => (
                    <option key={idx} value={slot.openingTime}>
                      {slot.openingTime}
                    </option>
                  ))}
                </CFormSelect>
                {errors.openingTime && (
                  <CFormFeedback invalid>{errors.openingTime}</CFormFeedback>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>
                  Closing Time <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormSelect
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleInputChange}
                  invalid={!!errors.closingTime}
                  disabled={loadingTimings}
                >
                  <option value="">Select Closing Time</option>
                  {timings.map((slot, idx) => (
                    <option key={idx} value={slot.closingTime}>
                      {slot.closingTime}
                    </option>
                  ))}
                </CFormSelect>
                {errors.closingTime && (
                  <CFormFeedback invalid>{errors.closingTime}</CFormFeedback>
                )}
              </CCol>
            </CRow>

            <h5 className="mb-3 mt-6" style={{ color: NGK_COLORS.primary }}>Licenses & Certifications</h5>

            <CRow className='mb-3'>
              <CCol md={6}>
                <CFormLabel>
                  License Number<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  invalid={!!errors.licenseNumber}
                />
                {errors.licenseNumber && (
                  <CFormFeedback invalid>{errors.licenseNumber}</CFormFeedback>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel>
                  Issuing Authority<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="issuingAuthority"
                  value={formData.issuingAuthority}
                  onChange={handleInputChange}
                  onKeyDown={preventNumberInput}
                  invalid={!!errors.issuingAuthority}
                />
                {errors.issuingAuthority && (
                  <CFormFeedback invalid>{errors.issuingAuthority}</CFormFeedback>
                )}
              </CCol>

            </CRow>
            <CRow className="mb-3">
              <FileInput
                label="Trade Licence / Shop & Establishment Certificate"
                name="tradeLicense"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.tradeLicence}
              />

              <FileInput
                label="Fire Safety Certificate"
                name="fireSafetyCertificate"
                accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.fireSafetyCertificate}
              />
            </CRow>
            <CRow className='mb-3'>
              <FileInput
                label="GST Registration Certificate"
                name="gstRegistrationCertificate"
                accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.gstRegistrationCertificate}
              />
              <FileInput
                label="Professional Indemnity Insurance"
                name="professionalIndemnityInsurance"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.professionalIndemnityInsurance}
                required={false}  // <-- makes it optional
              />

            </CRow>

            <h5 className="mb-3 mt-6" style={{ color: NGK_COLORS.primary }}>Virtual Tour & Branch Info</h5>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Virtual Clinic Tour
                </CFormLabel>

                <CFormInput
                  type="url"
                  placeholder="https://example.com/VirtualClinicTour"
                  value={formData.walkthrough || ""}
                  onChange={(e) => {
                    const { value } = e.target;

                    // Keep condition & URL validation
                    if (value.trim()) {
                      try {
                        new URL(value); // still checks URL format
                      } catch {

                      }
                    }

                    // Only update state (no errors)
                    setFormData((prev) => ({
                      ...prev,
                      walkthrough: value,
                    }));
                  }}
                />
              </CCol>

              {/* ✅ Branch Input */}

              <CCol md={6}>
                <CFormLabel>
                  Branch <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter branch name"
                  value={formData.branch || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    setFormData((prev) => ({ ...prev, branch: value }));
                    if (!value) {
                      setErrors((prev) => ({ ...prev, branch: "Branch name is required" }))
                    }
                    else {
                      setErrors((prev) => ({ ...prev, branch: "" }))
                    }
                  }}

                  invalid={!!errors.branch}
                />
                {errors.branch && <CFormFeedback invalid>{errors.branch}</CFormFeedback>}
              </CCol>

            </CRow>

            <h5 className="mb-3 mt-6" style={{ color: NGK_COLORS.primary }}>Social Media</h5>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>Instagram</CFormLabel>
                <CFormInput
                  type="text"
                  id="instagram"
                  placeholder="@clinic_handle"
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Facebook</CFormLabel>
                <CFormInput
                  type="text"
                  id="facebook"
                  placeholder="facebook.com/clinic"
                  name="facebookHandle"
                  value={formData.facebookHandle}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Twitter</CFormLabel>
                <CFormInput
                  type="text"
                  id="twitter"
                  placeholder="@clinic_tweet"
                  name="twitterHandle"
                  value={formData.twitterHandle}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>
            <h5 className="mb-3 mt-6" style={{ color: NGK_COLORS.primary }}>Clinic Staff & Pharmacist</h5>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Clinic has a valid pharmacist
                  <span style={{ color: 'red' }}>*</span>
                </CFormLabel>

                <CFormSelect
                  value={selectedPharmacistOption}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedPharmacistOption(value);

                    setFormData(prev => ({
                      ...prev,
                      hasPharmacist: value
                    }));

                    // Only remove error if user selects a valid option
                    setErrors(prev => ({
                      ...prev,
                      hasPharmacist: value ? '' : prev.hasPharmacist
                    }));
                  }}
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </CFormSelect>

                {errors.hasPharmacist && (
                  <CFormFeedback invalid>{errors.hasPharmacist}</CFormFeedback>
                )}
              </CCol>

              {selectedPharmacistOption === 'Yes' && (
                <FileInput
                  label="Pharmacist Certificate"
                  name="pharmacistCertificate"
                  accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  setErrors={setErrors}
                  inputRef={refs.pharmacistCertificate}
                />)}
            </CRow>
            <h5 className="mb-3 mt-6" style={{ color: NGK_COLORS.primary }}>Location & Coordinates</h5>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Clinic Latitude <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  placeholder="Enter latitude"
                  value={formData.latitude || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    setFormData((prev) => ({ ...prev, latitude: value }));

                    // validate immediately
                    const lat = parseFloat(value);
                    let error = "";
                    if (!value) {
                      error = "Latitude is required";
                    } else if (isNaN(lat) || lat < -90 || lat > 90) {
                      error = "Latitude must be between -90 and 90";
                    }

                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      if (error) {
                        newErrors.latitude = error;
                      } else {
                        delete newErrors.latitude; // ✅ remove error when valid
                      }
                      return newErrors;
                    });
                  }}
                  invalid={!!errors.latitude}
                />
                {errors.latitude && (
                  <CFormFeedback invalid>{errors.latitude}</CFormFeedback>
                )}

              </CCol>

              <CCol md={6}>
                <CFormLabel>
                  Clinic Longitude <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  placeholder="Enter longitude"
                  value={formData.longitude || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    setFormData((prev) => ({ ...prev, longitude: value }));

                    // validate immediately
                    const lng = parseFloat(value);
                    let error = "";
                    if (!value) {
                      error = "Longitude is required";
                    } else if (isNaN(lng) || lng < -180 || lng > 180) {
                      error = "Longitude must be between -180 and 180";
                    }

                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      if (error) {
                        newErrors.longitude = error;
                      } else {
                        delete newErrors.longitude; // ✅ remove error when valid
                      }
                      return newErrors;
                    });
                  }}
                  invalid={!!errors.longitude}
                />
                {errors.longitude && (
                  <CFormFeedback invalid>{errors.longitude}</CFormFeedback>
                )}

              </CCol>
            </CRow>

            <h5 className="mb-3 mt-6" style={{ color: NGK_COLORS.primary }}>Other Attachments / Documents</h5>
            <CRow className="mb-3">
              <FileInput
                label="Clinic Contract"
                name="contractorDocuments"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.contractorDocuments} // ✅ should match ref name
              />
              <FileInput
                label="Clinic Logo"
                name="hospitalLogo"
                accept=".jpeg,.jpg,.png"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.hospitalLogo}
              />
              <FileInput
                label="Clinic Documents"
                name="hospitalDocuments"
                accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                tooltip="Issued by Local Fire Department"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.hospitalDocuments}
              />
              <FileInput
                label="Clinical Establishment Registration Certificate"
                name="clinicalEstablishmentCertificate"
                accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.clinicalEstablishmentCertificate}
              />
              <FileInput
                label="Business Registration Certificate"
                name="businessRegistrationCertificate"
                accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.businessRegistrationCertificate}
              />
              <FileInput
                label="Biomedical Waste Management Authorization"
                name="biomedicalWasteManagementAuth"
                tooltip="Issued by State Pollution Control Board (SPCB)"
                accept=".pdf,.doc,.docx,.jpeg,.png"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                inputRef={refs.biomedicalWasteManagementAuth}
              />

              {/* OTHERS FILE UPLOAD */}
              <CCol md={6}>
                <CTooltip content="NABH Accreditation / Aesthetic Procedure Training Certificate">
                  <CFormLabel>Others (NABH / Aesthetic Training)</CFormLabel>
                </CTooltip>

                <CFormInput
                  type="file"
                  name="others"
                  multiple
                  onChange={(e) => handleAppendFiles(e, "others", 6)}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                  invalid={!!errors.others}
                  disabled={nabhSubmitted}                 // ❌ Disable upload when NABH submitted
                />

                {errors.others && (
                  <CFormFeedback invalid>{errors.others}</CFormFeedback>
                )}

                {/* Show Selected Files */}
                {Array.isArray(formData.others) && formData.others.length > 0 && (
                  <div className="mt-2">
                    {formData.others.map((file, index) => (
                      <div
                        key={index}
                        className="d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1"
                      >
                        <small className="text-dark">{file.name}</small>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            const updatedFiles = formData.others.filter((_, i) => i !== index);
                            setFormData((prev) => ({
                              ...prev,
                              others: updatedFiles,
                            }));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CCol>

              {/* NABH SCORE + BUTTON */}
              <CCol md={6}>
                <CFormLabel className="me-3">NABH Score</CFormLabel>

                {nabhScore !== null && (
                  <span className="me-3 fw-bold text-success">{nabhScore}</span>
                )}

                <div className="mt-2">
                  <CButton
                    onClick={() => !nabhSubmitted && setShowNabhModal(true)}
                    disabled={
                      nabhSubmitted || (formData.others && formData.others.length > 0)
                    }
                    style={{ backgroundColor: NGK_COLORS.primary, color: "white" }}
                  >
                    Open NABH Questionnaire
                  </CButton>
                </div>
              </CCol>
            </CRow>

            {/* Doctor Details */}
            <h5 className="mb-3 mt-6" style={{ color: NGK_COLORS.primary }}>Doctor Details</h5>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>Doctor Name<span style={{ color: 'red' }}>*</span></CFormLabel>
                <CFormInput
                  name="doctorName"
                  value={doctorEntry.doctorName}
                  onChange={handleDoctorChange}
                  invalid={!!errors.doctorName}
                />
                <CFormFeedback invalid>{errors.doctorName}</CFormFeedback>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Specialization<span style={{ color: 'red' }}>*</span></CFormLabel>
                <CFormInput
                  name="specialization"
                  value={doctorEntry.specialization}
                  onChange={handleDoctorChange}
                  invalid={!!errors.specialization}
                />
                <CFormFeedback invalid>{errors.specialization}</CFormFeedback>
              </CCol>

              <CCol md={4}>
                <CFormLabel>Registration Number<span style={{ color: 'red' }}>*</span></CFormLabel>
                <CFormInput
                  name="registrationNumber"
                  value={doctorEntry.registrationNumber}
                  onChange={handleDoctorChange}
                  invalid={!!errors.registrationNumber}
                />
                <CFormFeedback invalid>{errors.registrationNumber}</CFormFeedback>
              </CCol>

              <CCol md={4}>
                <CFormLabel>Association Number<span style={{ color: 'red' }}>*</span></CFormLabel>
                <CFormInput
                  name="associationNumber"
                  value={doctorEntry.associationNumber}
                  onChange={handleDoctorChange}
                  invalid={!!errors.associationNumber}
                />
                <CFormFeedback invalid>{errors.associationNumber}</CFormFeedback>
              </CCol>

              <CCol md={4}>
                <CFormLabel>Association Name<span style={{ color: 'red' }}>*</span></CFormLabel>
                <CFormInput
                  name="associationName"
                  value={doctorEntry.associationName}
                  onChange={handleDoctorChange}
                  invalid={!!errors.associationName}
                />
                <CFormFeedback invalid>{errors.associationName}</CFormFeedback>
              </CCol>
            </CRow>

            <CButton
              style={{ backgroundColor: NGK_COLORS.primary, color: "white" }}
              // color="primary"
              className="mb-3"
              onClick={(e) => {
                e.preventDefault();  // ⛔ Prevent form submit
                handleAddDoctor();
              }}
            >
              {editDoctorIndex !== null ? 'Update Doctor' : '+ Add Doctor'}
            </CButton>

            {errors.doctorsList && (
              <p style={{ color: "red" }}>{errors.doctorsList}</p>
            )}


            {/* Doctor Table */}
            {doctorsList.length > 0 && (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}> {/* Scrollable container */}
                <CTable striped hover responsive>
                  <CTableHead className="pink-table">
                    <CTableRow className="text-center">
                      <CTableHeaderCell>S.No</CTableHeaderCell>
                      <CTableHeaderCell>Doctor Name</CTableHeaderCell>
                      <CTableHeaderCell>Specialization</CTableHeaderCell>
                      <CTableHeaderCell>Registration No</CTableHeaderCell>
                      <CTableHeaderCell>Association No</CTableHeaderCell>
                      <CTableHeaderCell>Association Name</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody className="pink-table">
                    {doctorsList.map((doctor, index) => (
                      <CTableRow key={index} className="text-center align-middle">
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{doctor.doctorName || '-'}</CTableDataCell>
                        <CTableDataCell>{doctor.specialization || '-'}</CTableDataCell>
                        <CTableDataCell>{doctor.registrationNumber || '-'}</CTableDataCell>
                        <CTableDataCell>{doctor.associationNumber || '-'}</CTableDataCell>
                        <CTableDataCell>{doctor.associationName || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            <button
                              type="button"     // ⛔ Prevent submit
                              className="actionBtn edit"
                              onClick={() => handleEditDoctor(index)}
                            >
                              <Edit2 size={18} />
                            </button>

                            <button
                              type="button"     // ⛔ VERY IMPORTANT
                              className="actionBtn delete"
                              onClick={() => {
                                setDoctorIndexToDelete(index);
                                setIsModalVisible(true);
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            )}
            <CModal visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
              <CModalHeader>
                <CModalTitle>Confirm Delete</CModalTitle>
              </CModalHeader>
              <CModalBody>
                Are you sure you want to delete this doctor?
              </CModalBody>
              <CModalFooter>
                <CButton color="danger" onClick={confirmDeleteDoctor}>
                  Delete
                </CButton>
                <CButton color="secondary" onClick={() => setIsModalVisible(false)}>
                  Cancel
                </CButton>
              </CModalFooter>
            </CModal>

            <CModal visible={showNabhModal} onClose={() => setShowNabhModal(false)} size="lg" className="custom-modal"
              backdrop="static">
              <CModalHeader>
                <CModalTitle>NABH Questionnaire</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {nabhQuestions.map((question, index) => (
                  <CRow key={index} className="mb-4">
                    {/* Question with number */}
                    <CCol md={12}>
                      <CFormLabel>
                        {index + 1}. {question}
                      </CFormLabel>
                    </CCol>

                    {/* Radio buttons below the question */}
                    <CCol md={12} className="d-flex mt-2">
                      <CFormCheck
                        type="radio"
                        name={`nabh-${index}`}
                        id={`nabh-${index}-yes`}
                        label="Yes"
                        checked={nabhAnswers[index] === true}
                        onChange={() => {
                          const updated = [...nabhAnswers];
                          updated[index] = true;
                          setNabhAnswers(updated);
                        }}
                        className="me-4"
                      />
                      <CFormCheck
                        type="radio"
                        name={`nabh-${index}`}
                        id={`nabh-${index}-no`}
                        label="No"
                        checked={nabhAnswers[index] === false}
                        onChange={() => {
                          const updated = [...nabhAnswers];
                          updated[index] = false;
                          setNabhAnswers(updated);
                        }}
                      />

                    </CCol>
                  </CRow>
                ))}
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setShowNabhModal(false)}>
                  Close
                </CButton>
                <CButton color="primary" onClick={handleNabhSubmit}>
                  Save
                </CButton>
              </CModalFooter>
            </CModal>

            {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <CButton color="secondary" onClick={() => navigate('/clinic-management')}>
                Cancel
              </CButton>
              <CButton type="submit" color="success" className="me-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving Data...
                  </>
                ) : (
                  'Save Clinic'
                )}
              </CButton>
            </div>
          </CForm>

          <CModal
            visible={showSuccessModal}
            alignment="center"
            backdrop="static"
          >
            <CModalHeader>
              <CModalTitle>Registration Successful</CModalTitle>
            </CModalHeader>

            <CModalBody>
              <p><strong>Status:</strong> {successResponse?.status}</p>
              <p><strong>Message:</strong> {successResponse?.message}</p>
              <p><strong>Clinic ID:</strong> {successResponse?.clinicId}</p>
            </CModalBody>

            <CModalFooter>
              <CButton
                color="success"
                onClick={() => {
                  setShowSuccessModal(false);
                  window.close();   // 🔥 closes window
                }}
              >
                OK
              </CButton>
            </CModalFooter>
          </CModal>


        </CCardBody>
      </CCard>
      {
        isSuccess && <ClinicOnboardingSuccess
          clinicName={formData.clinicName}
          onClose={() => window.close()}
        />
      }
    </div >

  )
}

export default ClinicRegistration