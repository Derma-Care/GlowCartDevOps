import React, { useEffect, useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import { AllClinicData, NGkRegistrationLink, statusapi } from '../../baseUrl'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye } from 'lucide-react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormInput,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CFormSelect, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from '@coreui/react'
import { COLORS } from '../../Constant/Themes'
import LoadingIndicator from '../../Utils/loader'
import { toast } from 'react-toastify'

// ------------------------------------------
// BACKEND → UI STATUS MAPPER
// ------------------------------------------
const mapBackendStatusToUI = (status) => {
  switch (status) {
    case "PENDING":
      return "pending"
    case "VERIFICATION_IN_PROGRESS":
      return "start"
    case "VERIFIED":
      return "verified"
    case "REJECTED":
      return "rejected"
    default:
      return "pending"
  }
}

// ------------------------------------------
// UI → BACKEND STATUS MAPPER
// ------------------------------------------
const mapUIStatusToBackend = (status) => {
  switch (status) {
    case "pending":
      return "PENDING"
    case "start":
      return "VERIFICATION_IN_PROGRESS"
    case "verified":
      return "VERIFIED"
    case "rejected":
      return "REJECTED"
    default:
      return "PENDING"
  }
}

const ClinicManagement = ({ service }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
const [linkInputValue,setLinkInputValue]=useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false) // For viewing details
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [inputValue, setInputValue] = useState("");
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [isLink, setIsLink] = useState(false);
  const [loadingLink, setLoadingLink] = useState(false);

  // --------------------- FETCH CLINICS ---------------------
  useEffect(() => {
    fetchClinics()
    if (location.state?.newClinic) {
      setClinics(prev => [...prev, location.state.newClinic])
    }
  }, [location.state?.newClinic])

  const fetchClinics = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${AllClinicData}`)
      const clinicList = Array.isArray(response.data)
        ? response.data
        : response.data.hospitalCategory || response.data.data || []
      setClinics(clinicList)
    } catch {
      toast.error('Failed to load clinics')
    } finally {
      setLoading(false)
    }
  }

  // --------------------- STATUS CHANGE ---------------------
const handleStatusChange = async (newStatus, clinicId) => {
  const backendStatus = mapUIStatusToBackend(newStatus);

  try {
    if (newStatus === "pending") {
      toast.warning("Status set to Pending");
    }

    if (newStatus === "start") {
      await statusapi.startClinic(clinicId);
      toast.info("Verification started!");
    }

    if (newStatus === "verified") {
      await statusapi.verifyClinic(clinicId);
      toast.success("Clinic verified successfully!");
    }

    if (newStatus === "rejected") {
      setModalVisible(true);
      setSelectedClinicId(clinicId);
      return; // Open modal (toast will fire after submit)
    }

    // Update UI state
    setClinics(prev =>
      prev.map(c =>
        c.clinicId === clinicId ? { ...c, status: backendStatus } : c
      )
    );

  } catch (err) {
    console.error(err);
    toast.error("Failed to update status");
  }
};


const handleSubmitModal = async () => {
  try {
    await statusapi.rejectClinic(selectedClinicId, inputValue);
    toast.error("Clinic rejected successfully!"); // Red toast
  } catch (err) {
    toast.error("Failed to reject clinic");
  }
  setModalVisible(false);
};



  // --------------------- SEARCH & PAGINATION ---------------------
  const filteredClinics = clinics.filter(
    clinic =>
      clinic.name?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      clinic.contactNumber?.startsWith(searchTerm) ||
      clinic.email?.toLowerCase().startsWith(searchTerm.toLowerCase())
  )

  useEffect(() => { setCurrentPage(1) }, [searchTerm])
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredClinics.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage)

  // --------------------- SEND LINK ---------------------
const sendNGKRegistrationLink = async (email) => {
  try {
    setLoadingLink(true);

    const response = await fetch(`${NGkRegistrationLink}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await response.json();  // ✅ parse first

    if (!response.ok || data.success === false) {
      // Backend error message (your example)
      toast.error(data.message || "Failed to send link");
      return;
    }

    // Success case
    toast.success(data.message || "Registration link sent successfully!");
    setIsLink(false);
    setInputValue("");

  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setLoadingLink(false);
  }
};


  return (
    <>
      <CCard className="mt-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">{service?.categoryName} Clinics</h2>
            <CButton
              color="secondary"
              style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
              onClick={() => setIsLink(true)}
            >
              Send Link
            </CButton>

          </div>
        </CCardHeader>

        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="col-4 mx-2">
              <CFormInput
                type="text"
                autoComplete="off"
                style={{ border: '1px solid #7e3a93' }}
                placeholder="Search by Clinic Name, Mobile, or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-2 text-end">
              No.of Hospitals: {filteredClinics.length}
            </div>
          </div>

          {loading ? (
            <LoadingIndicator message="Fetching Clinic Details, please wait..." />
          ) : (
            <CTable striped hover responsive>
              <CTableHead className="pink-table">
                <CTableRow>
                  <CTableHeaderCell>S.No</CTableHeaderCell>
                  <CTableHeaderCell>Clinic Name</CTableHeaderCell>
                  <CTableHeaderCell>Contact Number</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>City</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>

                </CTableRow>
              </CTableHead>

              <CTableBody className="pink-table">
                {currentItems.length > 0 ? (
                  currentItems.map((clinic, index) => (
                    <CTableRow key={clinic?.clinicId || index}>
                      <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                      <CTableDataCell>{clinic?.name}</CTableDataCell>
                      <CTableDataCell>{clinic?.contactNumber}</CTableDataCell>
                      <CTableDataCell>{clinic?.email}</CTableDataCell>
                      <CTableDataCell>{clinic?.city}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <button className="actionBtn"
                          onClick={() => {
                            setSelectedClinic(clinic)
                            setDetailsModalVisible(true)
                          }} title="View" > View </button>
                      </CTableDataCell>
                      <CFormSelect
                        value={mapBackendStatusToUI(clinic?.status)}
                        onChange={(e) => handleStatusChange(e.target.value, clinic.clinicId)}
                        style={{ color: "var(--color-black)" }}

                      >
                        <option value="pending">Pending</option>
                        <option value="start">Started</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </CFormSelect>

                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="7" className="text-center">
                      No clinics found
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          )}

          {filteredClinics.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <label className="me-2">Rows per page:</label>
                <CFormSelect
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  style={{ width: '80px', display: 'inline-block' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </CFormSelect>
              </div>

              <div>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredClinics.length)} of {filteredClinics.length} entries
              </div>

              <CPagination align="end">
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </CPaginationItem>

                {[...Array(totalPages)].map((_, idx) => (
                  <CPaginationItem
                    key={idx + 1}
                    active={currentPage === idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </CPaginationItem>
                ))}

                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Update Status</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CFormInput
            type="text"
            label="Enter value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type something..."
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSubmitModal}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>


      <CModal visible={isLink} onClose={() => setIsLink(false)}>
        <CModalHeader>
          <CModalTitle>Registration Link</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CFormInput
            type="text"
            autoComplete="email"
            label="Mobile number / Email Id"
            value={linkInputValue}
            onChange={(e) => setLinkInputValue(e.target.value)}
            placeholder="Type something..."
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setIsLink(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={() => sendNGKRegistrationLink(linkInputValue)} disabled={loadingLink}>
            {loadingLink ? "Sending..." : "Send"}
          </CButton>
        </CModalFooter>
      </CModal>
      {/* --------------------- DETAILS MODAL --------------------- */}
      <CModal visible={detailsModalVisible} onClose={() => setDetailsModalVisible(false)} size="lg"> 
        <CModalHeader closeButton> <CModalTitle>Clinic Details</CModalTitle> </CModalHeader>
        <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedClinic ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {/* Text Fields */} <div><strong>Name:</strong> {selectedClinic.name || '-'}</div>
              <div><strong>Address:</strong> {selectedClinic.address || '-'}</div>
              <div><strong>City:</strong> {selectedClinic.city || '-'}</div>
              <div><strong>Contact Number:</strong> {selectedClinic.contactNumber || '-'}</div>
              <div><strong>WhatsApp Number:</strong> {selectedClinic.whatsappNumber || '-'}</div>
              <div><strong>Email:</strong> {selectedClinic.email || '-'}</div>
              <div><strong>Website:</strong> {selectedClinic.website || '-'}</div>
              <div><strong>License Number:</strong> {selectedClinic.licenseNumber || '-'}</div>
              <div><strong>Issuing Authority:</strong> {selectedClinic.issuingAuthority || '-'}</div>
              <div><strong>Recommended:</strong> {selectedClinic.recommended ? 'Yes' : 'No'}</div>
              <div><strong>Clinic Software:</strong> {selectedClinic.clinicSoftware ? 'Yes' : 'No'}</div>
              <div><strong>Clinic Type:</strong> {selectedClinic.clinicType || '-'}</div>
              <div><strong>Medicines Sold On Site:</strong> {selectedClinic.medicinesSoldOnSite ? 'Yes' : 'No'}</div>
              <div><strong>Has Pharmacist:</strong> {selectedClinic.hasPharmacist || '-'}</div>
              <div><strong>Clinic Specialization:</strong> {selectedClinic.clinicSpecializationType || '-'}</div>
              <div><strong>Primary Contact Person:</strong> {selectedClinic.primaryContactPerson || '-'}</div>
              <div><strong>Designation:</strong> {selectedClinic.designation || '-'}</div>
              <div><strong>Alternate Contact Number:</strong> {selectedClinic.alternateContactNumber || '-'}</div>
              <div><strong>Software Usage:</strong> {selectedClinic.clinicManagementSoftwareUsage || '-'}</div>
              <div><strong>Subscription:</strong> {selectedClinic.subscription || '-'}</div>
              <div><strong>Bank Account Name / Bank Account Number:</strong> {selectedClinic.bankAccountName || '-'} / {selectedClinic.bankAccountNumber || '-'}</div>
              <div><strong>IFSC / UPI / PAN:</strong> {selectedClinic.ifscCode || '-'} / {selectedClinic.upiId || '-'} / {selectedClinic.panNumber || '-'}</div>
              <div><strong>NABH Score:</strong> {selectedClinic.nabhScore || '-'}</div>
              <div><strong>Branch:</strong> {selectedClinic.branch || '-'}</div>

            </div>) : (
            <p>No details available</p>)}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDetailsModalVisible(false)}>Close</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ClinicManagement
