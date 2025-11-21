import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CButton,
  CForm,
  CFormInput,
  CFormLabel, CPagination, CPaginationItem,
  CRow,
  CCol,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormSelect,
  CFormFeedback,
} from '@coreui/react'
import { DoctorAllData, BASE_URL, UpdateClinic, DeleteClinic, CLINIC_ADMIN_URL } from '../../baseUrl'
import { getClinicTimings } from './AddClinicAPI'
import ProcedureManagementDoctor from './ProcedureManagementDoctor'
import DocumentField from './DocumentField'
import axios from 'axios'
import { toast } from 'react-toastify'
import DoctorCard from '../Doctors/DoctorCard'
import AddDoctors from '../Doctors/AddDoctors'
import { fetchBranchByBranchId } from './AddBranchAPI'
import PackageManagement from '../PackageManagement/PackageManagement'

const ClinicDetails = () => {
  const { hospitalId, branchId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [formErrors, setFormErrors] = useState({})
  const [clinicData, setClinicData] = useState(null)
  const [editableClinicData, setEditableClinicData] = useState({ consultationExpiration: '' })
  const [timings, setTimings] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingTimings, setLoadingTimings] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [allDoctors, setAllDoctors] = useState([])
  const [branchData, setBranchData] = useState(null)
  const [branchNotFound, setBranchNotFound] = useState(false)
  const [isEditingAdditional, setIsEditingAdditional] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [editDoctorModal, setEditDoctorModal] = useState(false)
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = allDoctors.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.max(1, Math.ceil(allDoctors.length / itemsPerPage))
  // ---------------------- API calls ----------------------
  const fetchClinicDetails = async () => {
    if (!hospitalId) return
    setLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/admin/getClinicById/${hospitalId}`)
      const fetchedData = response?.data?.data || null
      const localExpiration = localStorage.getItem(`clinic-${hospitalId}-consultation-expiration`)
      if (fetchedData) {
        if (localExpiration) fetchedData.consultationExpiration = localExpiration
        setClinicData(fetchedData)
        setEditableClinicData(fetchedData)
      }
    } catch (error) {
      console.error('Error fetching clinic details:', error)
      toast.error('Failed to fetch clinic details')
    } finally {
      setLoading(false)
    }
  }

  // Fetch doctors for a particular clinic + branch
  // Accepts clinicId (required) and branchId (optional)
  const fetchDoctorsForClinicAndBranch = async (clinicIdParam, branchIdParam) => {
    if (!clinicIdParam) return
    try {
      // If backend endpoint requires both clinicId and branchId
      let url = ''
      if (branchIdParam) {
        url = `${BASE_URL}/admin/getDoctorsByHospitalIdAndBranchId/${clinicIdParam}/${branchIdParam}`
      } else {
        // fallback endpoint for clinic-only doctors (adjust if your backend differs)
        url = `${BASE_URL}/admin/getDoctorsByHospitalId/${clinicIdParam}`
      }
      const res = await axios.get(url)
      const docs = res?.data?.data || []
      setAllDoctors(docs)
      setCurrentPageSafe(1)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to fetch doctors')
      setAllDoctors([])
    }
  }


  // safe setter for current page
  const setCurrentPageSafe = (p) => {
    setCurrentPage(p)
  }


  const fetchAllDoctors = async () => {
    // Deprecated in favor of fetchDoctorsForClinicAndBranch, kept for compatibility
    if (!hospitalId) return
    await fetchDoctorsForClinicAndBranch(hospitalId, branchId)
  }
  // Fetch branch data by branchId
  const fetchBranch = async (bId) => {
    if (!bId) return null
    try {
      const res = await fetchBranchByBranchId(bId)
      // fetchBranchByBranchId may return different shapes. Normalize:
      const branch = res?.data || res?.data?.data || res || null
      return branch
    } catch (error) {
      console.error('fetchBranch error', error)
      return null
    }
  }
  // Delete clinic
  const handleDeleteClinic = async () => {
    if (!hospitalId) return
    try {
      const res = await axios.delete(`${BASE_URL}/${DeleteClinic}/${hospitalId}`)
      toast.success(res.data.message || 'Clinic deleted')
      navigate('/clinic-Management')
    } catch (error) {
      console.error('Failed to delete clinic:', error)
      toast.error('Failed to delete clinic')
    }
  }

  // Delete doctor
  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return
    try {
      const response = await axios.delete(`${BASE_URL}/admin/deleteDoctor/${selectedDoctor.doctorId}`)
      if (response?.data?.success) {
        toast.success(`Dr. ${selectedDoctor.doctorName} deleted successfully!`)
        setAllDoctors((prev) => prev.filter((d) => d.doctorId !== selectedDoctor.doctorId))
      } else {
        toast.error(response?.data?.message || 'Failed to delete doctor')
      }
    } catch (error) {
      console.error('Error deleting doctor:', error)
      toast.error('Error deleting doctor')
    } finally {
      setShowDeleteModal(false)
      setSelectedDoctor(null)
    }
  }
  // PDF preview helper
  const openPdfPreview = (base64) => {
    try {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i))
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl)
    } catch (err) {
      console.error('Failed to open PDF', err)
      toast.error('Invalid PDF')
    }
  }
  // ---------------------- effects ----------------------
  // tab from querystring
  useEffect(() => {
    const tab = parseInt(searchParams.get('tab')) || 0
    setActiveTab(tab)
  }, [searchParams])


  useEffect(() => {
    // initial load
    fetchClinicDetails()
    // Try to fetch doctors by hospitalId first (fallback)
    if (hospitalId) fetchDoctorsForClinicAndBranch(hospitalId, branchId)
  }, [hospitalId])


  useEffect(() => {
    // timings
    const fetchTimingsData = async () => {
      setLoadingTimings(true)
      try {
        const result = await getClinicTimings()
        if (result?.success) setTimings(result.data)
        else toast.error(result?.message || 'Failed to fetch clinic timings')
      } catch (error) {
        console.error('Timings fetch error', error)
        toast.error('Failed to fetch clinic timings')
      } finally {
        setLoadingTimings(false)
      }
    }
    fetchTimingsData()
  }, [])
  useEffect(() => {
    // When branchId changes, fetch branch and then fetch doctors for that branch
    if (!branchId) {
      setBranchData(null)
      setBranchNotFound(false)
      return
    }


    const loadBranchAndDoctors = async () => {
      setLoading(true)
      try {
        const branch = await fetchBranch(branchId)
        if (!branch) {
          setBranchData(null)
          setAllDoctors([])
          setBranchNotFound(true)
          toast.error('Branch not found')
          return
        }


        // backend might return { success:false, message: 'Branch not found' }
        if (branch?.success === false) {
          setBranchData(null)
          setAllDoctors([])
          setBranchNotFound(true)
          toast.error(branch.message || 'Branch not found')
          return
        }


        // set normalized branchData object
        const normalizedBranch = branch?.data || branch
        setBranchData(normalizedBranch)
        setBranchNotFound(false)


        // If branch contains clinicId, fetch doctors by clinicId + branchId
        const clinicIdFromBranch = normalizedBranch?.clinicId || hospitalId
        await fetchDoctorsForClinicAndBranch(clinicIdFromBranch, branchId)
      } catch (error) {
        console.error('Error fetching branch details:', error)
        toast.error('Error fetching branch details')
      } finally {
        setLoading(false)
      }
    }


    loadBranchAndDoctors()
  }, [branchId])

  // ---------------------- helpers ----------------------
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex)
    setSearchParams({ tab: tabIndex })
  }


  const openDeleteModal = (doctor) => {
    setSelectedDoctor(doctor)
    setShowDeleteModal(true)
  }


  // ---------------------- render ----------------------
  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <CCard className="mt-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Clinic Profile</h3>
        <CButton color="secondary" onClick={() => navigate(-1)}>
          Back
        </CButton>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <>
            <CNav variant="tabs">
              <CNavItem>
                <CNavLink active={activeTab === 0} onClick={() => handleTabChange(0)}>
                  Basic Details
                </CNavLink>
              </CNavItem>
              <CNavItem>

                <CNavLink active={activeTab === 1} onClick={() => handleTabChange(1)}>
                  Additional Details
                </CNavLink>
              </CNavItem>
              {/* <CNavItem>
                <CNavLink active={activeTab === 2} onClick={() => handleTabChange(2)}>
                  Doctors
                </CNavLink>
              </CNavItem> */}

              <CNavItem>
                <CNavLink active={activeTab === 3} onClick={() => handleTabChange(3)}>
                  Procedures
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink active={activeTab === 4} onClick={() => handleTabChange(4)}>
                  Appointments
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink active={activeTab === 5} onClick={() => handleTabChange(5)}>
                  Packages
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent className="mt-3">
              {/* Tab 1: Basic Details */}
              <CTabPane visible={activeTab === 0}>
                <CForm className="p-3 border rounded shadow-sm bg-white">
                  {/* Clinic Logo Section */}
                  <CRow className="mb-4 align-items-start">
                    <CCol md={6}>
                      <CFormLabel>Clinic Name <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.name || ''}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const value = e.target.value
                          setEditableClinicData((prev) => ({ ...prev, name: value }))

                          // Validation
                          if (!value.trim()) {
                            setFormErrors((prev) => ({
                              ...prev,
                              name: "Clinic Name is required",
                            }))
                            return
                          }

                          if (value.trim().length < 3) {
                            setFormErrors((prev) => ({
                              ...prev,
                              name: "Clinic Name must be at least 3 characters",
                            }))
                            return
                          }

                          // ✅ Allow all characters, no regex restriction
                          setFormErrors((prev) => ({ ...prev, name: "" }))
                        }}


                      //   setEditableClinicData((prev) => ({ ...prev, name: value }))
                      // }}
                      />
                      {formErrors.name && <div className="text-danger mt-1">{formErrors.name}</div>}
                    </CCol>
                  </CRow>

                  {/* Contact & Location Section */}
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>
                        Contact Number <span className="text-danger">*</span>
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        maxLength={10}
                        value={editableClinicData.contactNumber || ''}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Always update the state
                          setEditableClinicData((prev) => ({ ...prev, contactNumber: value }));

                          // Validation
                          if (!value.trim()) {
                            setFormErrors((prev) => ({
                              ...prev,
                              contactNumber: 'Contact Number is required',
                            }));
                            return;
                          }

                          if (!/^\d*$/.test(value)) {
                            setFormErrors((prev) => ({
                              ...prev,
                              contactNumber: 'Only numeric values allowed',
                            }));
                            return;
                          }

                          const regex = /^[6-9][0-9]{9}$/; // exactly 10 digits starting with 6-9
                          if (value.length === 10 && !regex.test(value)) {
                            setFormErrors((prev) => ({
                              ...prev,
                              contactNumber: 'Must start with 6-9 and be 10 digits',
                            }));
                          } else if (value.length < 10) {
                            setFormErrors((prev) => ({
                              ...prev,
                              contactNumber: 'Must be exactly 10 digits',
                            }));
                          } else {
                            setFormErrors((prev) => ({ ...prev, contactNumber: '' }));
                          }
                        }}
                      />
                      {formErrors.contactNumber && (
                        <div className="text-danger mt-1">{formErrors.contactNumber}</div>
                      )}
                    </CCol>


                    <CCol md={6}>
                      <CFormLabel>Location <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.city || ''}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditableClinicData((prev) => ({ ...prev, city: value }))
                          if (!value.trim()) {
                            setFormErrors((prev) => ({
                              ...prev,
                              city: 'Location is required',
                            }))
                          } else if (value.trim().length < 3) {
                            setFormErrors((prev) => ({
                              ...prev,
                              city: 'Location must be at least 3 characters',
                            }))
                            return;
                          }
                          else {
                            setFormErrors((prev) => ({ ...prev, city: '' }))
                          }
                        }}
                      />
                      {formErrors.city && <div className="text-danger mt-1">{formErrors.city}</div>}
                    </CCol>
                    <CCol md={6} className="text-start mt-5">
                      {editableClinicData.hospitalLogo && (
                        <img
                          src={
                            editableClinicData.hospitalLogo.startsWith('data:')
                              ? editableClinicData.hospitalLogo
                              : `data:image/jpeg;base64,${editableClinicData.hospitalLogo}`
                          }
                          alt="Hospital Logo"
                          className="img-thumbnail mb-2"
                          style={{ maxWidth: '150px', height: 'auto' }}
                        />
                      )}

                      {isEditing && (
                        <CFormInput
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0]
                            const reader = new FileReader()

                            reader.onloadend = () => {
                              if (reader.result) {
                                const base64String = reader.result.split(',')[1]
                                setEditableClinicData({
                                  ...editableClinicData,
                                  hospitalLogo: base64String,
                                })
                              }
                            }

                            if (file) {
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      )}
                    </CCol>
                  </CRow>

                  {isEditing ? (
                    <>
                      <CButton
                        color="success"
                        className="me-2"
                        onClick={async () => {

                          try {
                            // Validate form first
                            const isValid = validateForm();
                            console.log('Form valid?', isValid); // ✅ Check validation
                            if (!isValid) return; // stop if invalid


                            // Proceed to save
                            await updateClinicData(hospitalId, editableClinicData);
                            await fetchClinicDetails();
                            setIsEditing(false);
                          } catch (error) {
                            console.error('Error updating clinic:', error);
                          }
                        }}
                      >
                        Save
                      </CButton>

                      <CButton
                        color="secondary"
                        className="me-2"
                        onClick={() => {
                          setIsEditing(false)
                          setEditableClinicData(clinicData) // ✅ reset to original details
                        }}
                      >
                        Cancel
                      </CButton>
                    </>
                  ) : (
                    <>
                      <CButton
                        color="primary"
                        className="me-2"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </CButton>

                      {/* ✅ Only show Delete when not editing */}
                      <CButton
                        color="danger"
                        style={{ color: 'white' }}
                        onClick={() => setShowDeleteModal(true)}
                      >
                        Delete Clinic
                      </CButton>
                    </>
                  )}

                  {/* <CButton color="primary" style={{color:'white', float:'right'}} onClick={()=>setShowBranchForm(true)}>Add Branches</CButton> */}
                  {/* <AddBranchForm visible={showBranchForm} onClose={()=>setShowBranchForm(false)} /> */}
                </CForm>
              </CTabPane>

              {/* Tab 2: Additional Details */}
              <CTabPane visible={activeTab === 1}>
                <CForm>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Email <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="email"
                        value={editableClinicData.emailAddress || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value
                          setEditableClinicData((prev) => ({
                            ...prev,
                            emailAddress: value,
                          }))

                          // live validation
                          if (!value.includes('@')) {
                            setFormErrors((prev) => ({
                              ...prev,
                              emailAddress: 'Email must contain "@"',
                            }))
                          } else {
                            setFormErrors((prev) => ({
                              ...prev,
                              emailAddress: '',
                            }))
                          }
                        }}
                      />
                      {formErrors.emailAddress && (
                        <div className="text-danger mt-1">{formErrors.emailAddress}</div>
                      )}
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>City <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.city || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          setEditableClinicData({ ...editableClinicData, city: e.target.value })
                          setFormErrors((prev) => ({ ...prev, city: '' }))
                        }}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Website <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.website || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) =>
                          setEditableClinicData({ ...editableClinicData, website: e.target.value })
                        }
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Issuing Authority <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.issuingAuthority || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value
                          const regex = /^[A-Za-z\s]*$/

                          if (!regex.test(value)) {
                            setFormErrors((prev) => ({
                              ...prev,
                              issuingAuthority: 'Only alphabets and spaces allowed',
                            }))
                          } else {
                            setFormErrors((prev) => ({ ...prev, issuingAuthority: '' }))
                          }

                          setEditableClinicData((prev) => ({
                            ...prev,
                            issuingAuthority: value,
                          }))
                        }}
                      />
                      {formErrors.issuingAuthority && (
                        <div className="text-danger mt-1">{formErrors.issuingAuthority}</div>
                      )}
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Opening Time <span className="text-danger">*</span></CFormLabel>
                      <CFormSelect
                        value={editableClinicData.openingTime || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          setEditableClinicData({
                            ...editableClinicData,
                            openingTime: e.target.value,
                          });
                          setFormErrors((prev) => ({ ...prev, openingTime: '' }));
                        }}
                      >
                        <option value="">Select Opening Time <span className="text-danger">*</span></option>
                        {timings.length > 0 &&
                          timings.map((slot, idx) => (
                            <option key={idx} value={slot.openingTime}>
                              {slot.openingTime}
                            </option>
                          ))}
                      </CFormSelect>

                      {formErrors.openingTime && (
                        <div className="text-danger">{formErrors.openingTime}</div>
                      )}
                    </CCol>


                    <CCol md={6}>
                      <CFormLabel>Closing Time <span className="text-danger">*</span></CFormLabel>
                      <CFormSelect
                        value={editableClinicData.closingTime || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          setEditableClinicData({
                            ...editableClinicData,
                            closingTime: e.target.value,
                          })
                          setFormErrors((prev) => ({ ...prev, closingTime: '' }))
                        }}
                      >
                        <option value="">Select Closing Time</option>
                        {timings.map((slot, idx) => (
                          <option key={idx} value={slot.closingTime}>
                            {slot.closingTime}
                          </option>
                        ))}
                      </CFormSelect>
                      {formErrors.closingTime && (
                        <div className="text-danger">{formErrors.closingTime}</div>
                      )}
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6}>
                      <CFormLabel>Consultation Expiration (in days) <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        placeholder="Enter number of days"
                        value={editableClinicData.consultationExpiration || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) =>
                          setEditableClinicData((prev) => ({
                            ...prev,
                            consultationExpiration: e.target.value, // ✅ just a string
                          }))
                        }
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Free Follow-Ups (count) <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="number"
                        min={0}
                        placeholder="Enter number of follow-ups"
                        value={editableClinicData.freeFollowUps || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value
                          const isValid = /^\d+$/.test(value) // only digits
                          if (!isValid) {
                            setFormErrors((prev) => ({
                              ...prev,
                              freeFollowUps: 'Only positive numbers allowed',
                            }))
                          } else {
                            setFormErrors((prev) => ({ ...prev, freeFollowUps: '' }))
                          }
                          setEditableClinicData((prev) => ({
                            ...prev,
                            freeFollowUps: value,
                          }))
                        }}
                      />
                      {formErrors.freeFollowUps && (
                        <div className="text-danger">{formErrors.freeFollowUps}</div>
                      )}
                    </CCol>

                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <CFormLabel>
                        Subscription<span className="text-danger">*</span>
                      </CFormLabel>
                      <CFormSelect
                        value={editableClinicData.subscription || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          setEditableClinicData({
                            ...editableClinicData,
                            subscription: e.target.value,
                          })
                          setFormErrors((prev) => ({ ...prev, subscription: '' }))
                        }}
                      >
                        <option value="">Select Subscription</option>
                        <option value="Free">Free</option>
                        <option value="Basic">Basic</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                      </CFormSelect>

                      {formErrors.subscription && (
                        <div className="text-danger">{formErrors.subscription}</div>
                      )}
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>License Number <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.licenseNumber || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) =>
                          setEditableClinicData({ ...editableClinicData, licenseNumber: e.target.value })
                        }
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Hospital Documents <span className="text-danger">*</span></CFormLabel>

                      <DocumentField
                        label="HospitalDocuments"
                        base64Data={editableClinicData.hospitalDocuments}
                        clinicName={editableClinicData.name || 'Clinic'}
                        isEditing={isEditingAdditional} // show Upload button only when editing
                        openPdfPreview={openPdfPreview} // your existing function to preview PDFs
                        onFileChange={(newBase64) => {
                          // Update parent state when user uploads a new file
                          setEditableClinicData((prev) => ({
                            ...prev,
                            hospitalDocuments: newBase64,
                          }))
                        }}
                      />
                    </CCol>

                    <CCol md={6} className="mt-3">
                      <CFormLabel>Hospital Contract Documents <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="ContractorDocuments"
                        base64Data={editableClinicData.contractorDocuments}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            contractorDocuments: newBase64,
                          }))
                        }}
                      />

                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Business Registration Certificate <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="BusinessRegistrationCertificate"
                        base64Data={editableClinicData.businessRegistrationCertificate}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            businessRegistrationCertificate: newBase64,
                          }))
                        }}
                      />
                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Biomedical Waste Management Auth <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="BioMedicalWasteManagementAuth"
                        base64Data={editableClinicData.biomedicalWasteManagementAuth}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            biomedicalWasteManagementAuth: newBase64,

                          }))
                        }}
                      />

                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Trade License <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="TradeLicense"
                        base64Data={editableClinicData.tradeLicense}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            tradeLicense: newBase64
                          }))
                        }}
                      />

                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Fire Safety Certificate <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="FireSafetyCertificate"
                        base64Data={editableClinicData.fireSafetyCertificate}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            fireSafetyCertificate: newBase64
                          }))
                        }}
                      />

                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Professional Indemnity Insurance <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="ProfessionalIndemnityInsurance"
                        base64Data={editableClinicData.professionalIndemnityInsurance}
                        clinciName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            professionalIndemnityInsurance: newBase64
                          }))
                        }}
                      />

                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>
                        Other Documents <span className="text-danger">*</span>
                      </CFormLabel>
                      <DocumentField
                        label="OtherDocuments"
                        base64Data={editableClinicData.others}
                        clinicName={editableClinicData.name || 'Clinic'}
                        isEditing={isEditingAdditional}
                        uploadType="multiple"
                        openPdfPreview={openPdfPreview}
                        onFileChange={(files) =>
                          setEditableClinicData((prev) => ({
                            ...prev,
                            others: files, // ✅ keep as array
                          }))
                        }
                      />
                    </CCol>


                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Drug License Certificate <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="DrugLicenceCertificate"
                        base64Data={editableClinicData.drugLicenseCertificate}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            drugLicenseCertificate: newBase64
                          }))
                        }}
                      />

                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Drug License Form Type <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="DrugLicenceFormType"
                        base64Data={editableClinicData.drugLicenseFormType}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            drugLicenseFormType: newBase64
                          }))
                        }}
                      />

                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Pharmacist Certificate <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="pharmacistCertificate"
                        base64Data={editableClinicData.pharmacistCertificate}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            pharmacistCertificate: newBase64
                          }))
                        }}
                      />

                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Clinical Establishment Certificate <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="ClinicalEstablishmentCertificate"
                        base64Data={editableClinicData.clinicalEstablishmentCertificate}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            clinicalEstablishmentCertificate: newBase64
                          }))
                        }}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mt-3">
                    <CCol md={6}>
                      <CFormLabel>Latitude <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="number"
                        step="any"
                        value={editableClinicData.latitude ?? ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value === '' ? null : parseFloat(value);
                          setEditableClinicData((prev) => ({
                            ...prev,
                            latitude: numValue,
                          }));

                          let error = ''
                          if (!value) {
                            error = "Latitude is required"
                          } else if (isNaN(numValue) || numValue < -90 || numValue > 90) {
                            error = "Latitude must be between -90 and 90";
                          }
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            if (error) {
                              newErrors.latitude = error;
                            } else {
                              delete newErrors.latitude;
                            }
                            return newErrors;
                          })
                        }}
                        invalid={!!formErrors.latitude}
                      // {formErrors.latitude && <CFormFeedback invalid>{form</CFormFeedback>}
                      />
                      {formErrors.latitude && (
                        <CFormFeedback invalid>{formErrors.latitude}</CFormFeedback>
                      )}
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>Longitude <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="number"
                        step="any"
                        value={editableClinicData.longitude ?? ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value === '' ? null : parseFloat(value);
                          setEditableClinicData((prev) => ({
                            ...prev,
                            longitude: numValue,
                          }));
                          let error = '';
                          if (!value) {
                            error = "Longitude is required"
                          } else if (isNaN(numValue) || numValue < -180 || numValue > 180) {
                            error = "Longitude must between -180 and 180";
                          }
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            if (error) {
                              newErrors.longitude = error;
                            } else {
                              delete newErrors.longitude;
                            }
                            return newErrors;
                          })
                        }}
                        invalid={!!formErrors.longitude}
                      />
                      {formErrors.longitude && (
                        <CFormFeedback invalid>{formErrors.longitude}</CFormFeedback>
                      )}
                    </CCol>
                  </CRow>

                  <CRow className="mt-3">
                    <CCol md={6}>
                      <CFormLabel>Walkthrough</CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.walkthrough ?? ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value;

                          setEditableClinicData((prev) => ({
                            ...prev,
                            walkthrough: value,
                          }));

                          // ✅ Validation
                          let error = '';
                          if (!value.trim()) {
                            error = 'Walkthrough URL is required';
                          } else if (
                            !/^https?:\/\/[^\s]+$/.test(value) // basic URL check
                          ) {
                            error = 'Please enter a valid URL (must start with http:// or https://)';
                          }

                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            if (error) {
                              newErrors.walkthrough = error;
                            } else {
                              delete newErrors.walkthrough;
                            }
                            return newErrors;
                          });
                        }}
                        invalid={!!formErrors.walkthrough}
                      />
                      {formErrors.walkthrough && (
                        <CFormFeedback invalid>{formErrors.walkthrough}</CFormFeedback>
                      )}

                      {!isEditingAdditional && editableClinicData.walkthrough && !formErrors.walkthrough && (
                        <a
                          href={editableClinicData.walkthrough}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary d-block mt-2"
                        >
                          Open Walkthrough
                        </a>
                      )}
                    </CCol>


                    <CCol md={6}>
                      <CFormLabel>NABH Score <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="number"
                        value={editableClinicData.nabhScore ?? ''}
                        disabled
                        onChange={(e) => {
                          const value = e.target.value;
                          const intValue = value === '' ? null : parseInt(value, 10);
                          setEditableClinicData((prev) => ({
                            ...prev,
                            nabhScore: intValue,
                          }));
                        }}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mt-3">
                    <CCol md={6}>
                      <CFormLabel>Branch <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.branch ?? ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditableClinicData((prev) => ({
                            ...prev,
                            branch: value,
                          }))
                          let error = '';
                          if (!value.trim()) {
                            error = "Branch Name is required"
                          }
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            if (error) {
                              newErrors.branch = error;
                            } else {
                              delete newErrors.branch;
                            }
                            return newErrors;   // ✅ must return
                          });
                        }}
                        invalid={!!formErrors.branch}
                      />
                      {formErrors.branch && (
                        <CFormFeedback invalid>{formErrors.branch}</CFormFeedback>
                      )}
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Address<span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.address ?? ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditableClinicData((prev) => ({
                            ...prev,
                            address: value,
                          }))
                          let error = '';
                          if (!value.trim()) {
                            error = "Address is required"
                          }
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            if (error) {
                              newErrors.address = error;
                            } else {
                              delete newErrors.address;
                            }
                            return newErrors;   // ✅ must return
                          });
                        }}
                        invalid={!!formErrors.address}
                      />
                      {formErrors.address && (
                        <CFormFeedback invalid>{formErrors.address}</CFormFeedback>
                      )}
                    </CCol>
                  </CRow>

                  {isEditingAdditional ? (
                    <>
                      <CButton
                        color="success"
                        className="me-2 mt-3"
                        onClick={async () => {
                          try {
                            const isValid = validateForm();
                            if (!isValid) {
                              toast.error("Please fix the errors before saving!");
                              return; // stop saving
                            }
                            localStorage.setItem(
                              `clinic-${hospitalId}-consultation-expiration`,
                              editableClinicData.consultationExpiration,
                            )
                            await updateClinicData(hospitalId, editableClinicData)
                            await fetchClinicDetails()
                            setIsEditingAdditional(false)
                          } catch (error) {
                            console.error('Error updating additional details:', error)
                          }
                        }}
                      >
                        Save
                      </CButton>

                      <CButton
                        color="secondary"
                        className="mt-3"
                        onClick={() => {
                          setIsEditingAdditional(false)
                          setEditableClinicData(clinicData) // ✅ reset to original values
                        }}
                      >
                        Cancel
                      </CButton>
                    </>
                  ) : (
                    <CButton
                      color="primary"
                      className="me-2 mt-3"
                      onClick={() => setIsEditingAdditional(true)}
                    >
                      Edit
                    </CButton>
                  )}
                </CForm>
              </CTabPane>

              {/* <CTabPane visible={activeTab === 2}>
                <CCardHeader>
                  <div className="d-flex justify-content-between align-items-center mb-3 w-100">
                    <h4 className="mb-0 text-center flex-grow-1">Doctor Details</h4>


                    <button
                      className="btn btn-info text-white d-flex align-items-center gap-2 shadow-sm rounded-pill px-4 py-2"
                      onClick={() => setModalVisible(true)}
                      style={{
                        background: 'linear-gradient(90deg, #0072CE 0%, #00AEEF 100%)',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '16px',
                      }}
                    >
                      <span>Add Doctor</span>
                    </button>
                  </div>
                </CCardHeader>
                {branchData?.clinicId ? (
                  <AddDoctors
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    clinicId={branchData.clinicId}
                    branchId={branchData.branchId}
                    closeForm={() => setModalVisible(false)}
                    fetchAllDoctors={() => fetchDoctorsForClinicAndBranch(branchData.clinicId, branchData.branchId)}
                  />
                ) : (
                  <AddDoctors
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    clinicId={hospitalId}
                    branchId={branchId}
                    closeForm={() => setModalVisible(false)}
                    fetchAllDoctors={() => fetchDoctorsForClinicAndBranch(hospitalId, branchId)}
                  />
                )}
                {branchNotFound && <p className="text-danger text-center mt-2">Branch not found</p>}
                {currentItems.length > 0 ? (
                  <div className="doctor-card-container">
                    {currentItems.map((doc) => (
                      <DoctorCard
                        key={doc.doctorId}
                        doctor={doc}
                        branchId={branchData?.branchId}
                        onEdit={() => {
                          setSelectedDoctor(doc)
                          setEditDoctorModal(true)
                        }}
                        onDelete={() => openDeleteModal(doc)}
                        onView={() => {
                          setSelectedDoctor(doc)
                          setShowDoctorModal(true)
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center">No Doctors Available</p>
                )}
                <div className="d-flex justify-content-center mt-3">
                  <CPagination aria-label="Doctors navigation">
                    <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPageSafe(Math.max(1, currentPage - 1))}>
                      Previous
                    </CPaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <CPaginationItem key={i} active={currentPage === i + 1} onClick={() => setCurrentPageSafe(i + 1)}>
                        {i + 1}
                      </CPaginationItem>
                    ))}
                    <CPaginationItem disabled={currentPage === totalPages} onClick={() => setCurrentPageSafe(Math.min(totalPages, currentPage + 1))}>
                      Next
                    </CPaginationItem>
                  </CPagination>
                </div>
                <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} alignment="center">
                  <CModalHeader>
                    <CModalTitle>Delete Doctor</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    Are you sure you want to delete Dr. {selectedDoctor?.doctorName || ''}?
                  </CModalBody>
                  <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                      Cancel
                    </CButton>
                    <CButton color="danger" onClick={handleDeleteDoctor}>
                      Delete
                    </CButton>
                  </CModalFooter>
                </CModal>


                <style>{`
.doctor-card-container {
display: flex;
flex-direction: column;
gap: 20px;
}
`}</style>
              </CTabPane> */}



              <CTabPane visible={activeTab === 3}>
                <ProcedureManagementDoctor clinicId={hospitalId} />
              </CTabPane>
              <CTabPane visible={activeTab === 4}>


              </CTabPane>
              <CTabPane visible={activeTab === 5}>
                <PackageManagement clinicId={hospitalId} branchId={branchId} />
              </CTabPane>

            </CTabContent>

            <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="custom-modal"
              backdrop="static">
              <CModalHeader>Delete Clinic</CModalHeader>
              <CModalBody>Are you sure you want to delete this clinic?</CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </CButton>
                <CButton color="danger" style={{ color: 'white' }} onClick={handleDeleteClinic}>
                  Confirm
                </CButton>
              </CModalFooter>
            </CModal>
            <CModal
              visible={showDoctorModal}
              onClose={() => setShowDoctorModal(false)}
              size="lg"
              backdrop="static" className='custom-modal'
            >
              <CModalHeader>
                <CModalTitle>Doctor Profile</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {selectedDoctor && (
                  <div className="container-fluid">
                    {/* Personal Info */}
                    <h6 className="text-primary border-bottom pb-2 mb-4">Personal Information</h6>
                    <CRow className="gy-4 align-items-start">
                      {/* Doctor Image */}
                      <CCol md={3} className="text-center">
                        <img
                          src={selectedDoctor.doctorPicture}
                          alt="Doctor"
                          className="img-thumbnail"
                          style={{ width: '100%', maxWidth: '180px', borderRadius: '10px' }}
                        />
                      </CCol>

                      {/* Doctor Info */}
                      <CCol md={9}>
                        <CRow className="gy-3">
                          <CCol md={6}>
                            <strong>Name:</strong>
                            <div className="text-muted">{selectedDoctor.doctorName}</div>
                          </CCol>
                          <CCol md={6}>
                            <strong>Contact:</strong>
                            <div className="text-muted">{selectedDoctor.doctorMobileNumber}</div>
                          </CCol>
                          <CCol md={6}>
                            <strong>Qualification:</strong>
                            <div className="text-muted">{selectedDoctor.qualification}</div>
                          </CCol>
                          <CCol md={6}>
                            <strong>Specialization:</strong>
                            <div className="text-muted">{selectedDoctor.specialization}</div>
                          </CCol>
                          <CCol md={6}>
                            <strong>Experience:</strong>
                            <div className="text-muted">{selectedDoctor.experience} years</div>
                          </CCol>
                        </CRow>
                      </CCol>
                    </CRow>

                    {/* Availability */}
                    <h6 className="text-primary border-bottom pb-2 mt-4 mb-3">Availability</h6>
                    <CRow className="gy-3">
                      <CCol md={6}>
                        <strong>Available Days:</strong>
                        <div className="text-muted">{selectedDoctor.availableDays}</div>
                      </CCol>
                      <CCol md={6}>
                        <strong>Available Times:</strong>
                        <div className="text-muted">{selectedDoctor.availableTimes}</div>
                      </CCol>
                    </CRow>

                    {/* Languages & Areas */}
                    <h6 className="text-primary border-bottom pb-2 mt-4 mb-3">Expertise</h6>
                    <CRow className="gy-3">
                      <CCol md={6}>
                        <strong>Languages:</strong>
                        <div className="text-muted">
                          {selectedDoctor.languages?.join(', ') || '-'}
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <strong>Focus Areas:</strong>
                        <div className="text-muted">
                          {selectedDoctor.focusAreas?.join(', ') || '-'}
                        </div>
                      </CCol>
                      <CCol md={12}>
                        <strong>Highlights:</strong>
                        <div className="text-muted">
                          {selectedDoctor.highlights?.join(', ') || '-'}
                        </div>
                      </CCol>
                    </CRow>

                    {/* Services */}
                    {/* Services */}
                    <h6 className="text-primary border-bottom pb-2 mt-4 mb-3">Services Offered</h6>
                    <CRow className="gy-3">
                      {/* Services List */}
                      <CCol md={12}>
                        <strong>Services:</strong>
                        {selectedDoctor.service && selectedDoctor.service.length > 0 ? (
                          <ul className="mt-2">
                            {selectedDoctor.service.map((s) => (
                              <li key={s.serviceId} className="text-muted">
                                {s.serviceName}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">-</p>
                        )}
                      </CCol>

                      {/* Sub Services List */}
                      <CCol md={12}>
                        <strong>Sub Services:</strong>
                        {selectedDoctor.subServices && selectedDoctor.subServices.length > 0 ? (
                          <ul className="mt-2">
                            {selectedDoctor.subServices.map((s) => (
                              <li key={s.subServiceId} className="text-muted">
                                {s.subServiceName}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">-</p>
                        )}
                      </CCol>
                    </CRow>

                    {/* Fees */}
                    <h6 className="text-primary border-bottom pb-2 mt-4 mb-3">Consultation Fees</h6>
                    <CRow className="gy-3">
                      <CCol md={6}>
                        <strong>In-Clinic:</strong>
                        <div className="text-muted">
                          ₹{selectedDoctor.doctorFees?.inClinicFee || 0}
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <strong>Video:</strong>
                        <div className="text-muted">
                          ₹{selectedDoctor.doctorFees?.vedioConsultationFee || 0}
                        </div>
                      </CCol>
                    </CRow>

                    {/* Profile Description */}
                    <h6 className="text-primary border-bottom pb-2 mt-4 mb-3">Profile Summary</h6>
                    <div className="border rounded p-3 bg-light text-muted">
                      {selectedDoctor.profileDescription || 'No description available.'}
                    </div>
                  </div>
                )}
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setShowDoctorModal(false)}>
                  Close
                </CButton>

              </CModalFooter>
            </CModal>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ClinicDetails
