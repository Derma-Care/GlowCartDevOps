import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CBadge,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Eye, Edit2, Trash2 } from 'lucide-react'

const defaultForm = {
  packageId: '',
  packageName: '',
  clinicId: '',
  clinicName: '',
  clinicAddress: '',
  procedures: [{ procedureName: '', noOfSittings: 1 }],
  sittings: 0,
  description: '',
  selectedProcedure: '',
  selectedSittings: 1,
  price: 0,
  discountPercentage: 0,
  discountAmount: 0,
  taxPercentage: 0,
  taxAmount: 0,
  gst: 0,
  gstAmount: 0,
  platformFeePercentage: 0,
  platformFee: 0,
  consultationFee: 0,
  discountedCost: 0,
  clinicPay: 0,
  finalCost: 0,
  status: 'Active',
  durationNumber: '',
  durationUnit: 'Day',
  duration: '',
}

const getBadgeColor = (status) => {
  switch (status) {
    case 'Active': return 'success'
    case 'Inactive': return 'secondary'
    case 'Expired': return 'danger'
    default: return 'secondary'
  }
}

const PackageManagement = () => {
  const [activeKey, setActiveKey] = useState(0)
  const [packages, setPackages] = useState([])
  const [clinics, setClinics] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [toDeleteId, setToDeleteId] = useState(null)
  const [allProcedures, setAllProcedures] = useState([])

  // ----- STATIC DATA -----
  useEffect(() => {
    setClinics([
      { clinicId: '1', clinicName: 'Sunshine Clinic', clinicAddress: '123 Street, City' },
      { clinicId: '2', clinicName: 'Healthy Life Clinic', clinicAddress: '456 Avenue, City' },
    ])
    setAllProcedures([
      { id: 1, name: 'Hair PRP' },
      { id: 2, name: 'Laser Facial' },
      { id: 3, name: 'Chemical Peel' },
    ])
    setPackages([
      {
        packageId: 'p1',
        packageName: 'Basic Hair Package',
        clinicId: '1',
        clinicName: 'Sunshine Clinic',
        clinicAddress: '123 Street, City',
        procedures: [{ procedureName: 'Hair PRP', noOfSittings: 3 }],
        price: 5000,
        duration: '3 Days',
        status: 'Active',
      },
      {
        packageId: 'p2',
        packageName: 'Skin Glow Package',
        clinicId: '2',
        clinicName: 'Healthy Life Clinic',
        clinicAddress: '456 Avenue, City',
        procedures: [{ procedureName: 'Laser Facial', noOfSittings: 2 }],
        price: 3000,
        duration: '1 Week',
        status: 'Inactive',
      },
    ])
  }, [])

  const validate = () => {
    const e = {}
    if (!form.packageName?.trim()) e.packageName = 'Package name is required'
    if (!form.price || Number(form.price) <= 0) e.price = 'Valid price is required'
    if (!form.durationNumber || !form.durationUnit) e.duration = 'Duration is required'
    if (!form.clinicId) e.clinicId = 'Clinic is required'
    if (!form.clinicAddress?.trim()) e.clinicAddress = 'Clinic address is required'
    if (!form.procedures.length) e.procedures = 'At least one procedure is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const calculateTotals = (f) => {
    const price = Number(f.price) || 0
    const discountAmount = (price * (f.discountPercentage || 0)) / 100
    const taxAmount = ((price - discountAmount) * (f.taxPercentage || 0)) / 100
    const gstAmount = ((price - discountAmount) * (f.gst || 0)) / 100
    const platformFee = ((price - discountAmount) * (f.platformFeePercentage || 0)) / 100
    const discountedCost = price - discountAmount + taxAmount + gstAmount + (f.consultationFee || 0)
    const finalCost = discountedCost + platformFee
    const clinicPay = discountedCost - platformFee

    return { ...f, discountAmount, taxAmount, gstAmount, platformFee, discountedCost, finalCost, clinicPay }
  }

  const handleAddOrUpdate = (e) => {
    e.preventDefault()
    if (!validate()) return

    const finalDuration =
      form.durationNumber && form.durationUnit
        ? `${form.durationNumber} ${form.durationUnit}${form.durationNumber > 1 ? 's' : ''}`
        : ''

    const prepared = calculateTotals({ ...form, duration: finalDuration })

    if (isEditMode && selectedPackage) {
      setPackages((prev) =>
        prev.map((p) => (p.packageId === selectedPackage.packageId ? prepared : p))
      )
      toast.success('Package updated successfully')
    } else {
      prepared.packageId = `p${packages.length + 1}`
      setPackages((prev) => [...prev, prepared])
      toast.success('Package added successfully')
    }

    setModalVisible(false)
    setForm(defaultForm)
    setSelectedPackage(null)
    setIsEditMode(false)
  }

  const handleDeleteConfirm = () => {
    setPackages((prev) => prev.filter((p) => p.packageId !== toDeleteId))
    toast.success('Package deleted successfully')
    setDeleteModalVisible(false)
  }

  const filteredPackages =
    activeKey === 0 ? packages : packages.filter((p) => p.status === ['All', 'Active', 'Inactive', 'Expired'][activeKey])

  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentItems = filteredPackages.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage) || 1

  const onEdit = (pkg) => {
    setIsEditMode(true)
    setSelectedPackage(pkg)
    let durationNumber = ''
    let durationUnit = 'Day'
    if (pkg.duration) {
      const parts = pkg.duration.trim().split(' ')
      durationNumber = parts[0] || ''
      durationUnit = parts[1]?.replace(/s$/, '') || 'Day'
    }
    setForm({ ...pkg, durationNumber, durationUnit })
    setModalVisible(true)
  }

  const RequiredLabel = ({ label }) => <span>{label} <span style={{ color: 'red' }}>*</span></span>

  const renderTable = () => (
    <CTable striped hover responsive>
      <CTableHead className='pink-table'>
        <CTableRow>
          <CTableHeaderCell>S.No</CTableHeaderCell>
          <CTableHeaderCell>Name</CTableHeaderCell>
          <CTableHeaderCell>Clinic</CTableHeaderCell>
          <CTableHeaderCell>Price</CTableHeaderCell>
          <CTableHeaderCell>Duration</CTableHeaderCell>
          <CTableHeaderCell>Status</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody className='pink-table'>
        {currentItems.length ? (
          currentItems.map((pkg, i) => (
            <CTableRow key={pkg.packageId}>
              <CTableDataCell>{indexOfFirst + i + 1}</CTableDataCell>
              <CTableDataCell>{pkg.packageName}</CTableDataCell>
              <CTableDataCell>{pkg.clinicName}</CTableDataCell>
              <CTableDataCell>₹{pkg.price}</CTableDataCell>
              <CTableDataCell>{pkg.duration}</CTableDataCell>
              <CTableDataCell><CBadge color={getBadgeColor(pkg.status)}>{pkg.status}</CBadge></CTableDataCell>
              <CTableDataCell className="text-center">
                 <div className="d-flex justify-content-center align-items-center gap-2">
                <button  className="actionBtn view" title="View" onClick={() => { setSelectedPackage(pkg); setViewModalVisible(true) }} ><Eye size={16} /></button>
                <button className="actionBtn edit" title="Edit" onClick={() => onEdit(pkg)} ><Edit2 size={16} /></button>
             <button className="actionBtn delete" title="Delete" onClick={() => { setToDeleteId(pkg.packageId); setDeleteModalVisible(true) }}><Trash2 size={16} /></button>
               </div>  </CTableDataCell>
            </CTableRow>
          ))
        ) : (
          <CTableRow>
            <CTableDataCell colSpan={7} className="text-center text-muted">No records found</CTableDataCell>
          </CTableRow>
        )}
      </CTableBody>
    </CTable>
  )

  return (
    <CCard className="shadow-sm border-light">
      <ToastContainer position="top-right" />
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4>Package Management</h4>
        <CButton color="primary" onClick={() => { setIsEditMode(false); setSelectedPackage(null); setForm(defaultForm); setModalVisible(true) }}>+ Add Package</CButton>
      </CCardHeader>
      <CCardBody>
        <CNav variant="tabs" className="mb-3">
          {['All', 'Active', 'Inactive', 'Expired'].map((tab, i) => (
            <CNavItem key={i}>
              <CNavLink active={activeKey === i} onClick={() => setActiveKey(i)}>{tab}</CNavLink>
            </CNavItem>
          ))}
        </CNav>
        <CTabContent>
          <CTabPane visible>{renderTable()}</CTabPane>
        </CTabContent>

        {/* Add/Edit Modal */}
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
          <CModalHeader><CModalTitle>{isEditMode ? 'Edit Package' : 'Add Package'}</CModalTitle></CModalHeader>
          <form onSubmit={handleAddOrUpdate}>
            <CModalBody>
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormInput label={<RequiredLabel label="Package Name" />} value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} />
                </CCol>
                <CCol md={6}>
                  <CFormInput label={<RequiredLabel label="Price" />} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancel</CButton>
              <CButton color="primary" type="submit">{isEditMode ? 'Update' : 'Add'}</CButton>
            </CModalFooter>
          </form>
        </CModal>

        {/* View Modal */}
        <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)}>
          <CModalHeader><CModalTitle>Package Details</CModalTitle></CModalHeader>
          <CModalBody>
            {selectedPackage && (
              <div>
                <p><strong>Name:</strong> {selectedPackage.packageName}</p>
                <p><strong>Clinic:</strong> {selectedPackage.clinicName}</p>
                <p><strong>Price:</strong> ₹{selectedPackage.price}</p>
                <p><strong>Duration:</strong> {selectedPackage.duration}</p>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setViewModalVisible(false)}>Close</CButton>
          </CModalFooter>
        </CModal>

        {/* Delete Modal */}
        <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
          <CModalHeader><CModalTitle>Confirm Delete</CModalTitle></CModalHeader>
          <CModalBody>Are you sure you want to delete this package?</CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>Cancel</CButton>
            <CButton color="danger" onClick={handleDeleteConfirm}>Delete</CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  )
}

export default PackageManagement
