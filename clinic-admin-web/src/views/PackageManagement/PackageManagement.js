// Cleaned PackageManagement.jsx (optimized, removed duplicates)
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
import { COLORS } from '../../Constant/Themes'

const getBadgeColor = (status) => {
  switch (status) {
    case 'Active': return 'success'
    case 'Inactive': return 'secondary'
    case 'Expired': return 'danger'
    default: return 'secondary'
  }
}

const PackageManagement = () => {
  const [activeKey, setActiveKey] = useState(0) // 0 = ALL
  const [packages, setPackages] = useState([
    { id: 1, name: 'Basic Plan', price: '500', duration: '1 Month', status: 'Active' },
    { id: 2, name: 'Premium Plan', price: '1500', duration: '3 Months', status: 'Inactive' },
    { id: 3, name: 'Gold Plan', price: '5000', duration: '1 Year', status: 'Active' },
    { id: 4, name: 'Platinum Plan', price: '12000', duration: '1 Year', status: 'Expired' },
  ])

  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const [selectedPackage, setSelectedPackage] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', duration: '', status: 'Active' })
  const [errors, setErrors] = useState({})

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [toDeleteId, setToDeleteId] = useState(null)

  const packageOptions = ['Basic Plan', 'Premium Plan', 'Gold Plan', 'Platinum Plan']

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const t = setTimeout(() => setErrors({}), 2000)
      return () => clearTimeout(t)
    }
  }, [errors])

  const statusForKey = (key) => {
    if (key === 0) return 'All'
    if (key === 1) return 'Active'
    if (key === 2) return 'Inactive'
    return 'Expired'
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Package name is required'
    if (!form.price.trim()) e.price = 'Price is required'
    if (!form.duration.trim()) e.duration = 'Duration is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAddOrUpdate = (e) => {
    e.preventDefault()
    if (!validate()) return

    const duplicate = packages.some(
      (p) => p.name.toLowerCase() === form.name.toLowerCase() && (!isEditMode || p.id !== selectedPackage?.id)
    )
    if (duplicate) return setErrors({ name: 'Package already exists' })

    if (isEditMode && selectedPackage) {
      setPackages((prev) => prev.map((p) => (p.id === selectedPackage.id ? { ...p, ...form } : p)))
      toast.success('Package updated successfully')
    } else {
      const nextId = packages.length ? packages[packages.length - 1].id + 1 : 1
      setPackages([...packages, { id: nextId, ...form }])
      toast.success('Package added successfully')
    }

    setModalVisible(false)
    setIsEditMode(false)
    setSelectedPackage(null)
    setForm({ name: '', price: '', duration: '', status: 'Active' })
  }

  const handleDelete = () => {
    setPackages((prev) => prev.filter((p) => p.id !== toDeleteId))
    toast.success('Package deleted successfully')
    setDeleteModalVisible(false)
  }

  // APPLY ALL FILTER WHEN ACTIVEKEY = 0
  const filteredPackages =
    activeKey === 0 ? packages : packages.filter((p) => p.status === statusForKey(activeKey))

  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentItems = filteredPackages.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage) || 1

  const renderTable = () => (
    <>
      <CTable striped hover responsive>
        <CTableHead className="pink-table">
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Price</CTableHeaderCell>
            <CTableHeaderCell>Duration</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody className="pink-table">
          {currentItems.length ? (
            currentItems.map((pkg, i) => (
              <CTableRow key={pkg.id}>
                <CTableDataCell>{indexOfFirst + i + 1}</CTableDataCell>
                <CTableDataCell>{pkg.name}</CTableDataCell>
                <CTableDataCell>₹{pkg.price}</CTableDataCell>
                <CTableDataCell>{pkg.duration}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color={getBadgeColor(pkg.status)}>{pkg.status}</CBadge>
                </CTableDataCell>
                <CTableDataCell className="text-center">
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <button
                      className="actionBtn"
                      onClick={() => {
                        setSelectedPackage(pkg)
                        setViewModalVisible(true)
                      }}
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      className="actionBtn"
                      onClick={() => {
                        setIsEditMode(true)
                        setSelectedPackage(pkg)
                        setForm(pkg)
                        setModalVisible(true)
                      }}
                    >
                      <Edit2 size={18} />
                    </button>

                    <button
                      className="actionBtn"
                      onClick={() => {
                        setToDeleteId(pkg.id)
                        setDeleteModalVisible(true)
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={6} className="text-center text-muted">
                No records found
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {filteredPackages.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Rows per page:
            <select
              className="ms-2"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>

          <div>
            <span className="me-3">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredPackages.length)} of{' '}
              {filteredPackages.length}
            </span>

            <CPagination>
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </CPaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <CPaginationItem
                  key={i}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </CPaginationItem>
              ))}

              <CPaginationItem
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </CPaginationItem>
            </CPagination>
          </div>
        </div>
      )}
    </>
  )

  return (
    <CCard className="shadow-sm border-light">
      <ToastContainer position="top-right" />

      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Package Management</h4>

        <CButton
          style={{ backgroundColor: COLORS.black, color: 'white' }}
          onClick={() => {
            setIsEditMode(false)
            setForm({ name: '', price: '', duration: '', status: 'Active' })
            setModalVisible(true)
          }}
        >
          + Add Package
        </CButton>
      </CCardHeader>

      <CCardBody>
        {/* TABS */}
        <CNav variant="tabs" className="mb-3">
          <CNavItem>
            <CNavLink active={activeKey === 0} onClick={() => setActiveKey(0)}>
              All
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
              Active
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>
              Inactive
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
              Expired
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          <CTabPane visible>{renderTable()}</CTabPane>
        </CTabContent>

        {/* Add/Edit Modal */}
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>{isEditMode ? 'Edit Package' : 'Add Package'}</CModalTitle>
          </CModalHeader>

          <form onSubmit={handleAddOrUpdate}>
            <CModalBody>
              <CRow className="g-3">
                <CCol md={12}>
                  <CFormSelect
                    label="Package Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    invalid={!!errors.name}
                  >
                    <option value="">Select Package</option>
                    {packageOptions.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </CFormSelect>
                  {errors.name && <div className="text-danger mt-1">{errors.name}</div>}
                </CCol>

                <CCol md={6}>
                  <CFormInput
                    label="Price"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value.replace(/[^0-9]/g, '') })
                    }
                    invalid={!!errors.price}
                  />
                  {errors.price && <div className="text-danger mt-1">{errors.price}</div>}
                </CCol>

                <CCol md={6}>
                  <CFormInput
                    label="Duration"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    invalid={!!errors.duration}
                  />
                  {errors.duration && <div className="text-danger mt-1">{errors.duration}</div>}
                </CCol>

                <CCol md={12}>
                  <CFormSelect
                    label="Status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Expired</option>
                  </CFormSelect>
                </CCol>
              </CRow>
            </CModalBody>

            <CModalFooter>
              <CButton color="secondary" onClick={() => setModalVisible(false)}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit">
                {isEditMode ? 'Update' : 'Add'}
              </CButton>
            </CModalFooter>
          </form>
        </CModal>

        {/* View Modal */}
        <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Package Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectedPackage && (
              <div>
                <p>
                  <strong>Name:</strong> {selectedPackage.name}
                </p>
                <p>
                  <strong>Price:</strong> ₹{selectedPackage.price}
                </p>
                <p>
                  <strong>Duration:</strong> {selectedPackage.duration}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <CBadge color={getBadgeColor(selectedPackage.status)}>
                    {selectedPackage.status}
                  </CBadge>
                </p>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Delete Confirmation */}
        <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Confirm Delete</CModalTitle>
          </CModalHeader>
          <CModalBody>Are you sure you want to delete this package?</CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Delete
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  )
}

export default PackageManagement
