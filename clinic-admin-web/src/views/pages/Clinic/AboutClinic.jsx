/* eslint-disable react/prop-types *//* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CFormInput,
  CFormSwitch,
  CButton,
  CCard,
  CCardBody,
  CSpinner,
  CFormFeedback,
  CFormSelect,
} from '@coreui/react'
import axios from 'axios'
import { MainAdmin_URL } from '../../../baseUrl'
import { showCustomToast } from '../../../Utils/Toaster'
import { Edit2, Trash2 } from 'lucide-react'
import { emailPattern } from '../../../Constant/Constants'
import { http } from '../../../Utils/Interceptors'

const AboutClinic = ({setShowSettingsModal}) => {
  const clinicId = localStorage.getItem('HospitalId')

  /* ================= STATE ================= */
  const [pageLoading, setPageLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [edit, setEdit] = useState(false)
const [originalClinic, setOriginalClinic] = useState(null)
  const [clinic, setClinic] = useState({
    name: '',
    address: '',
    city: '',
    contactNumber: '',
    whatsappNumber: '',
    email: '',
    openingTime: '',
    closingTime: '',
    website: '',
    instagramHandle: '',
    twitterHandle: '',
    facebookHandle: '',
    primaryContactPerson: '',
    designation: '',
    alternateContactNumber: '',
    // medicinesSoldOnSite: '',
    // hasPharmacist: '',
    // clinicManagementSoftwareUsage: '',
    walkthrough: '',
    latitude: '',
    longitude: '',
    // recommended: false,
  })

    // "09:00 AM" → "09:00"
// "09:00 PM" → "21:00"
const to24Hour = (time12h) => {
  if (!time12h) return ''

  const [time, modifier] = time12h.split(' ')
  let [hours, minutes] = time.split(':')

  if (modifier === 'PM' && hours !== '12') {
    hours = String(parseInt(hours, 10) + 12)
  }
  if (modifier === 'AM' && hours === '12') {
    hours = '00'
  }

  return `${hours.padStart(2, '0')}:${minutes}`
}

// "09:00" → "09:00 AM"
// "21:00" → "09:00 PM"
const to12Hour = (time24h) => {
  if (!time24h) return ''

  let [hours, minutes] = time24h.split(':')
  const modifier = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12
  hours = hours ? hours : 12

  return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`
}

  /* ================= LOGO ================= */
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
const [originalDoctors, setOriginalDoctors] = useState([])

  /* ================= DOCTORS ================= */
  const [doctors, setDoctors] = useState([])
  const [editingDoctorIndex, setEditingDoctorIndex] = useState(null)
  const [originalLogo, setOriginalLogo] = useState(null) // backend image
 
  const [doctorForm, setDoctorForm] = useState({
    doctorName: '',
    registrationNumber: '',
    associationNumber: '',
    associationName: '',
    specialization: '',
  })

  /* ================= ERRORS ================= */
  const [errors, setErrors] = useState({})

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!clinicId) {
      showCustomToast('Clinic ID missing', 'error')
      setPageLoading(false)
      return
    }

    http
      .get(`${MainAdmin_URL}/clinics/get/${clinicId}`)
      .then((res) => {
        const data = res.data.data || {}

       const formattedClinic = {
  name: data.name || '',
  address: data.address || '',
  city: data.city || '',
  contactNumber: data.contactNumber || '',
  whatsappNumber: data.whatsappNumber || '',
  email: data.email || '',
  openingTime: to24Hour(data.openingTime),
  closingTime: to24Hour(data.closingTime),
  website: data.website || '',
  instagramHandle: data.instagramHandle || '',
  twitterHandle: data.twitterHandle || '',
  facebookHandle: data.facebookHandle || '',
  primaryContactPerson: data.primaryContactPerson || '',
  designation: data.designation || '',
  alternateContactNumber: data.alternateContactNumber || '',
//   medicinesSoldOnSite: data.medicinesSoldOnSite || '',
//   hasPharmacist: data.hasPharmacist || '',
//   clinicManagementSoftwareUsage: data.clinicManagementSoftwareUsage || '',
  walkthrough: data.walkthrough || '',
  latitude: data.latitude || '',
  longitude: data.longitude || '',
//   recommended: !!data.recommended,
//   status: data.status || 'ACTIVE',
}

// 🔒 ORIGINAL (IMMUTABLE)
setOriginalClinic(formattedClinic)

// ✏️ EDITABLE
setClinic(formattedClinic)


        setDoctors(data.doctorsList || [])
setOriginalDoctors(data.doctorsList || [])
        if (data.hospitalLogo) {
            setOriginalLogo(data.hospitalLogo)
          setLogoPreview(data.hospitalLogo)
        }
      })
      .catch(() => showCustomToast('Failed to load clinic data', 'error'))
      .finally(() => setPageLoading(false))
  }, [clinicId])

  /* ================= VALIDATION ================= */
  const validate = () => {
    const e = {}
    if (!clinic.name) e.name = 'Clinic name required'
    if (!clinic.address) e.address = 'Address required'
    if (!clinic.city) e.city = 'City required'
    if (!/^\d{10}$/.test(clinic.contactNumber)) e.contactNumber = 'Invalid number'
    if (!/^\d{10}$/.test(clinic.whatsappNumber)) e.whatsappNumber = 'Invalid number'
    if (!/^\d{10}$/.test(clinic.alternateContactNumber)) e.alternateContactNumber = 'Invalid number'
    // if (!emailPattern(clinic.email)) e.email = 'Invalid email' 
    if (!clinic.openingTime) e.openingTime = 'Required'
    if (!clinic.closingTime) e.closingTime = 'Required'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setClinic({ ...clinic, [name]: type === 'checkbox' ? checked : value })
  }

const handleLogoChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']

  if (!allowedTypes.includes(file.type)) {
    showCustomToast('Only PNG, JPG, and JPEG files are allowed', 'error')
    e.target.value = '' // reset input
    return
  }

  // Optional: size limit (example: 2MB)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    showCustomToast('Image size must be less than 2MB', 'error')
    e.target.value = ''
    return
  }

  setLogoFile(file)
  setLogoPreview(URL.createObjectURL(file))
}
const handleEditToggle = () => {
  if (edit) {
    // 🔴 CANCEL clicked → restore old data
    setClinic(originalClinic)
    setDoctors(originalDoctors)      // if used
    setLogoPreview(originalLogo)     // if used
    setLogoFile(null)
    setErrors({})
    setEdit(false)                   // ✅ FORCE BACK TO EDIT MODE
  } else {
    // ✏️ EDIT clicked
    setEdit(true)
  }
}


  /* ================= DOCTOR HANDLERS ================= */
  const handleDoctorChange = (e) => {
    const { name, value } = e.target
    setDoctorForm({ ...doctorForm, [name]: value })
  }

  const saveDoctor = () => {
    if (!doctorForm.doctorName || !doctorForm.registrationNumber || !doctorForm.specialization) {
      showCustomToast('Doctor name, registration & specialization required', 'error')
      return
    }

    if (editingDoctorIndex !== null) {
      const updated = [...doctors]
      updated[editingDoctorIndex] = doctorForm
      setDoctors(updated)
      setEditingDoctorIndex(null)
    } else {
      setDoctors([...doctors, doctorForm])
    }

    setDoctorForm({
      doctorName: '',
      registrationNumber: '',
      associationNumber: '',
      associationName: '',
      specialization: '',
    })
  }

  const editDoctor = (index) => {
    setDoctorForm(doctors[index])
    setEditingDoctorIndex(index)
  }

  const deleteDoctor = (index) => {
    setDoctors(doctors.filter((_, i) => i !== index))
  }

  /* ================= UPDATE ================= */
const handleUpdate = async () => {
     if (updateLoading) return
  if (!validate()) return

  const payload = {
    name: clinic.name,
    address: clinic.address,
    city: clinic.city,
    contactNumber: clinic.contactNumber,
    whatsappNumber: clinic.whatsappNumber,
    alternateContactNumber: clinic.alternateContactNumber,
    email: clinic.email,
    openingTime: to12Hour(clinic.openingTime),
    closingTime: to12Hour(clinic.closingTime),
    website: clinic.website,
    instagramHandle: clinic.instagramHandle,
    twitterHandle: clinic.twitterHandle,
    facebookHandle: clinic.facebookHandle,
    primaryContactPerson: clinic.primaryContactPerson,
    designation: clinic.designation,
    walkthrough: clinic.walkthrough,
    latitude: Number(clinic.latitude),
    longitude: Number(clinic.longitude),
    doctorsList: doctors,
  }

  setUpdateLoading(true)
 try {
  const response = await http.put(
    `${MainAdmin_URL}/clinics/${clinicId}`,
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  )

  showCustomToast('Clinic updated successfully', 'success')

  // ✅ Update localStorage
  updateSelectedHospitalStorage({
    ...payload,
    clinicId,
  })

  // ✅ Commit as original
  setOriginalClinic(clinic)
  setOriginalDoctors(doctors)
  setEdit(false)
  setTimeout(() => {
  window.location.reload()
}, 800)
//   setShowSettingsModal(false)
}  
 catch (err) {
    console.error('Update error:', err.response?.data || err)
    showCustomToast(
      err.response?.data?.message || 'Update failed',
      'error'
    )
  } finally {
    setUpdateLoading(false)
  setShowSettingsModal(false)

  }
}
const updateSelectedHospitalStorage = (updatedClinic) => {
  const stored = localStorage.getItem('selectedHospital')
  if (!stored) return

  const parsed = JSON.parse(stored)

  const updated = {
    ...parsed,
    hospitalName: updatedClinic.name,
    data: {
      ...parsed.data,
      ...updatedClinic,
    },
  }

  localStorage.setItem('selectedHospital', JSON.stringify(updated))
}



  /* ================= LOADING ================= */
  if (pageLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
        <CSpinner />
      </div>
    )
  }




  /* ================= UI ================= */
  return (
    <>
     <CRow className="mb-4 align-items-center">
  {/* LEFT : LOGO */}
  <CCol md={6} className="d-flex align-items-center">
    {logoPreview ? (
         <div className="d-flex justify-content-end align-items-center gap-3"> 
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 8,
          border: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
        }}
      >
        <img
          src={logoPreview}
          alt="Clinic Logo"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      {/* {edit && (
        <CFormInput
          type="file"
          accept=".png,.jpg,.jpeg"
          size="sm"
          onChange={handleLogoChange}
          style={{ maxWidth: 220 }}
        />
      )} */}
      </div>
    ) : (
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 8,
          border: '1px dashed #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: 12,
        }}
      >
        No Logo
      </div>
    )}
  </CCol>

  {/* RIGHT : ACTIONS */}
  <CCol md={6} className="text-end">
    <div className="d-flex justify-content-end align-items-center gap-3">
      

      <CButton
        size="sm"
        style={{
          background: 'var(--color-black)',
          color: 'var(--color-white)',
        }}
       onClick={handleEditToggle}
      >
        {edit ? 'Cancel' : 'Edit'}
      </CButton>
    </div>
  </CCol>
</CRow>


      {/* BASIC INFO */}
      <CCard className="mb-3">
        <CCardBody>
          <h5>Basic Information</h5>
          <CRow>
            <CCol md={6}>
              <CFormInput label="Clinic Name" name="name" value={clinic.name} disabled={!edit} invalid={!!errors.name} onChange={handleChange} />
              <CFormFeedback invalid>{errors.name}</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormInput label="City" name="city" value={clinic.city} disabled={!edit} invalid={!!errors.city} onChange={handleChange} />
              <CFormFeedback invalid>{errors.city}</CFormFeedback>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
      <CCard className="mb-3">
  <CCardBody>
    <h5>Contact Details</h5>
    <CRow>
      <CCol md={4}>
        <CFormInput
          label="Contact Number"
          name="contactNumber"
          value={clinic.contactNumber}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>

      <CCol md={4}>
        <CFormInput
          label="WhatsApp Number"
          name="whatsappNumber"
          value={clinic.whatsappNumber}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>

      <CCol md={4}>
        <CFormInput
          label="Email"
          name="email"
          value={clinic.email}
          disabled={true}
          onChange={handleChange}
        />
      </CCol>
    </CRow>
  </CCardBody>
</CCard>
<CCard className="mb-3">
  <CCardBody>
    <h5>Clinic Timings</h5>
    <CRow>
      <CCol md={6}>
        <CFormInput
          type="time"
          label="Opening Time"
          name="openingTime"
          value={clinic.openingTime}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>

      <CCol md={6}>
        <CFormInput
          type="time"
          label="Closing Time"
          name="closingTime"
          value={clinic.closingTime}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>
    </CRow>
  </CCardBody>
</CCard>
<CCard className="mb-3">
  <CCardBody>
    <h5>Online Presence</h5>
    <CRow>
      <CCol md={6}>
        <CFormInput
          label="Website"
          name="website"
          value={clinic.website}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>

      <CCol md={6}>
        <CFormInput
          label="Walkthrough URL"
          name="walkthrough"
          value={clinic.walkthrough}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>

      <CCol md={4} className="mt-2">
        <CFormInput
          label="Instagram"
          name="instagramHandle"
          value={clinic.instagramHandle}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>

      <CCol md={4} className="mt-2">
        <CFormInput
          label="Twitter"
          name="twitterHandle"
          value={clinic.twitterHandle}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>

      <CCol md={4} className="mt-2">
        <CFormInput
          label="Facebook"
          name="facebookHandle"
          value={clinic.facebookHandle}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>
    </CRow>
  </CCardBody>
</CCard>
<CCard className="mb-3">
  <CCardBody>
    <h5>Management</h5>
    <CRow>
      <CCol md={6}>
        <CFormInput
          label="Primary Contact Person"
          name="primaryContactPerson"
          value={clinic.primaryContactPerson}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>

      <CCol md={6}>
        <CFormInput
          label="Designation"
          name="designation"
          value={clinic.designation}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>

   <CCol md={4} className="mt-2">
        <CFormInput
          label="Alternate Contact Number"
          name="alternateContactNumber"
          value={clinic.alternateContactNumber}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>
   {/* 
      <CCol md={4} className="mt-2">
        <CFormInput
          label="Medicines Sold On Site"
          name="medicinesSoldOnSite"
          value={clinic.medicinesSoldOnSite}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>

      <CCol md={4} className="mt-2">
        <CFormInput
          label="Has Pharmacist"
          name="hasPharmacist"
          value={clinic.hasPharmacist}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol> */}
    </CRow>
  </CCardBody>
</CCard>
<CCard className="mb-3">
  <CCardBody>
    <h5>Location</h5>
    <CRow>
      <CCol md={6}>
        <CFormInput
          label="Latitude"
          name="latitude"
          value={clinic.latitude}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>

      <CCol md={6}>
        <CFormInput
          label="Longitude"
          name="longitude"
          value={clinic.longitude}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>
    </CRow>
  </CCardBody>
</CCard>
{/* <CCard className="mb-3">
  <CCardBody>
    <h5>Status</h5>

    <CRow>
      <CCol md={6}>
        <CFormSelect
          label="Clinic Status"
          name="status"
          value={clinic.status}
          disabled={!edit}
          onChange={handleChange}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="BLOCKED">Blocked</option>
          <option value="PENDING">Pending</option>
        </CFormSelect>
      </CCol>

      <CCol md={6} className="d-flex align-items-end">
        <CFormSwitch
          label="Recommended Clinic"
          name="recommended"
          checked={clinic.recommended}
          disabled={!edit}
          onChange={handleChange}
        />
      </CCol>
    </CRow>
  </CCardBody>
</CCard> */}



      {/* LOGO */}
      {/* <CCard className="mb-3">
        <CCardBody>
          <h5>Clinic Logo</h5>
          {logoPreview && <img src={logoPreview} style={{ maxHeight: 120 }} />}
          {edit && <CFormInput type="file" accept="image/*" onChange={handleLogoChange} />}
        </CCardBody>
      </CCard> */}

      {/* DOCTORS */}
 <CCard className="mb-3">
  <CCardBody>
    <h5>Doctors</h5>

    {/* Doctor Form */}
    <CRow className="mb-3">
      <CCol md={3}>
        <CFormInput
          label="Doctor Name"
          name="doctorName"
          value={doctorForm.doctorName}
          onChange={handleDoctorChange}
        />
      </CCol>

      <CCol md={3}>
        <CFormInput
          label="Registration Number"
          name="registrationNumber"
          value={doctorForm.registrationNumber}
          onChange={handleDoctorChange}
        />
      </CCol>

      <CCol md={3}>
        <CFormInput
          label="Association Number"
          name="associationNumber"
          value={doctorForm.associationNumber}
          onChange={handleDoctorChange}
        />
      </CCol>

      <CCol md={3}>
        <CFormInput
          label="Association Name"
          name="associationName"
          value={doctorForm.associationName}
          onChange={handleDoctorChange}
        />
      </CCol>

      <CCol md={3} className="mt-2">
        <CFormInput
          label="Specialization"
          name="specialization"
          value={doctorForm.specialization}
          onChange={handleDoctorChange}
        />
      </CCol>

      <CCol md={3} className="d-flex align-items-end mt-2">
        <CButton className='btn' style={{backgroundColor:"var(--color-black)",color:"var(--color-white)"}} onClick={saveDoctor}>
          {editingDoctorIndex !== null ? 'Update Doctor' : 'Add Doctor'}
        </CButton>
      </CCol>
    </CRow>

    {/* Doctors List */}
    {doctors.length === 0 && (
      <p className="text-muted">No doctors added yet</p>
    )}

    {doctors.map((doc, i) => (
      <CCard key={i} className="mb-2">
        <CCardBody className="d-flex justify-content-between align-items-center">
          <div>
            <strong>{doc.doctorName}</strong> — {doc.specialization}
            <div className="text-muted">
              Reg: {doc.registrationNumber} <br />
              {doc.associationName} ({doc.associationNumber})
            </div>
          </div>

          <div>
            <CButton
              size="sm"
              className='actionBtn'
              onClick={() => editDoctor(i)}
            >
              <Edit2 size={18} />
            </CButton>
            <CButton
              size="sm"
          
              className="ms-2 actionBtn"
              onClick={() => deleteDoctor(i)}
            >
            <Trash2 size={18} />
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    ))}
  </CCardBody>
</CCard>


      {edit && (
        <div className="text-end">
          <CButton  disabled={updateLoading} onClick={handleUpdate} style={{backgroundColor:"var(--color-black)",color:"var(--color-white)"}}>
            {updateLoading ? 'Updating...' : 'Save Changes'}
          </CButton>
          {/* <CButton type="button"  disabled={updateLoading} onClick={handleUpdate} style={{backgroundColor:"var(--color-black)",color:"var(--color-white)"}}>
  Save Changes
</CButton> */}

        </div>
      )}
    </>
  )
}

export default AboutClinic
