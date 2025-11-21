
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
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Eye, Edit2, Trash2, Plus, Search } from 'lucide-react'
import { COLORS } from '../../Constant/Themes' // remove or adjust if not present

const getBadgeColor = (status) => {
  switch (status) {
    case 'Active':
      return 'success'
    case 'Expired':
      return 'danger'
    case 'Pending':
      return 'warning'
    default:
      return 'secondary'
  }
}

const defaultForm = { name: '', membership: '', expiry: '', status: 'Active' }

const MembershipManagement = () => {
  const defaultData = [
    { id: 1, name: 'John Doe', membership: 'Gold', expiry: '2025-12-31', status: 'Active' },
    { id: 2, name: 'Jane Smith', membership: 'Silver', expiry: '2025-08-15', status: 'Expired' },
    { id: 3, name: 'Rahul Kumar', membership: 'Platinum', expiry: '2025-11-20', status: 'Active' },
    { id: 4, name: 'Ayesha Khan', membership: 'Silver', expiry: '2025-10-10', status: 'Pending' },
  ]

  // Persisted members (localStorage)
  const [members, setMembers] = useState(() => {
    const s = localStorage.getItem('members')
    return s ? JSON.parse(s) : defaultData
  })

  // UI state
  const [activeKey, setActiveKey] = useState(0) // 0 = All, 1 = Active, 2 = Expired, 3 = Pending
  const [searchText, setSearchText] = useState('')
  const [modalVisible, setModalVisible] = useState(false) // add/edit
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [toDeleteId, setToDeleteId] = useState(null)

  const membershipOptions = ['Silver', 'Gold', 'Platinum', 'Diamond']

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members))
  }, [members])

  // clear validation messages after short delay
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const t = setTimeout(() => setErrors({}), 2200)
      return () => clearTimeout(t)
    }
  }, [errors])

  // ensure page resets on filter/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeKey, searchText, itemsPerPage])

  const statusForKey = (key) => {
    if (key === 0) return 'All'
    if (key === 1) return 'Active'
    if (key === 2) return 'Expired'
    return 'Pending'
  }

  // Combined filter + search
  const filteredMembers = members.filter((m) => {
    const byTab = activeKey === 0 ? true : m.status === statusForKey(activeKey)
    const bySearch = m.name.toLowerCase().includes(searchText.trim().toLowerCase())
    return byTab && bySearch
  })

  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentItems = filteredMembers.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage))

  const validate = () => {
    const e = {}
    if (!form.name || !form.name.trim()) e.name = 'Member name is required'
    if (!form.membership || !form.membership.trim()) e.membership = 'Membership type is required'
    if (!form.expiry || !form.expiry.trim()) e.expiry = 'Expiry date is required'
    if (form.expiry && !/^\d{4}-\d{2}-\d{2}$/.test(form.expiry)) e.expiry = 'Use YYYY-MM-DD'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openAddModal = () => {
    setIsEditMode(false)
    setSelectedMember(null)
    setForm(defaultForm)
    setModalVisible(true)
  }

  const openEditModal = (member) => {
    setIsEditMode(true)
    setSelectedMember(member)
    setForm({ name: member.name, membership: member.membership, expiry: member.expiry, status: member.status })
    setModalVisible(true)
  }

  const openViewModal = (member) => {
    setSelectedMember(member)
    setViewModalVisible(true)
  }

  const handleAddOrUpdate = (e) => {
    e.preventDefault()
    if (!validate()) return

    const duplicate = members.some(
      (m) => m.name.toLowerCase() === form.name.toLowerCase() && (!isEditMode || m.id !== selectedMember?.id)
    )
    if (duplicate) {
      setErrors({ name: 'Member with this name already exists' })
      return
    }

    if (isEditMode && selectedMember) {
      setMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? { ...m, ...form } : m)))
      toast.success('Member updated successfully')
    } else {
      const nextId = members.length ? members[members.length - 1].id + 1 : 1
      setMembers((prev) => [...prev, { id: nextId, ...form }])
      toast.success('Member added successfully')
    }

    setModalVisible(false)
    setIsEditMode(false)
    setSelectedMember(null)
    setForm(defaultForm)
  }

  const openDeleteConfirm = (id) => {
    setToDeleteId(id)
    setDeleteModalVisible(true)
  }

  const handleDelete = () => {
    setMembers((prev) => prev.filter((m) => m.id !== toDeleteId))
    toast.success('Member deleted successfully')
    setDeleteModalVisible(false)
    setToDeleteId(null)
  }

  const renderTable = () => (
    <>
      <CTable striped hover responsive>
        <CTableHead className="pink-table">
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Member Name</CTableHeaderCell>
            <CTableHeaderCell>Membership Type</CTableHeaderCell>
            <CTableHeaderCell>Expiry Date</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody className="pink-table">
          {currentItems.length ? (
            currentItems.map((member, i) => (
              <CTableRow key={member.id}>
                <CTableDataCell>{indexOfFirst + i + 1}</CTableDataCell>
                <CTableDataCell>{member.name}</CTableDataCell>
                <CTableDataCell>{member.membership}</CTableDataCell>
                <CTableDataCell>{member.expiry}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color={getBadgeColor(member.status)}>{member.status}</CBadge>
                </CTableDataCell>
                <CTableDataCell className="text-center">
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <button
                      className="actionBtn"
                      onClick={() => openViewModal(member)}

                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="actionBtn"
                      onClick={() => openEditModal(member)}

                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="actionBtn"
                      onClick={() => openDeleteConfirm(member.id)} >
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

      {filteredMembers.length > 0 && (
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
              Showing {filteredMembers.length === 0 ? 0 : indexOfFirst + 1} to {Math.min(indexOfLast, filteredMembers.length)} of{' '}
              {filteredMembers.length}
            </span>

            <CPagination>
              <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                Previous
              </CPaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <CPaginationItem key={i} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </CPaginationItem>
              ))}

              <CPaginationItem disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
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
        <h4 className="mb-0">Membership Management</h4>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ minWidth: 220 }}>
            <CInputGroup>
              <CInputGroupText>
                <Search size={14} />
              </CInputGroupText>
              <CFormInput placeholder="Search by name..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </CInputGroup>
          </div>

          <CButton
            style={{ backgroundColor: COLORS?.black || '#000', color: 'white' }}
            onClick={openAddModal}
          >
            <Plus size={14} /> &nbsp; Add Member
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        {/* Summary */}
        <CRow className="mb-3 text-center">
          <CCol md={3}>
            <CCard className="bg-light shadow-sm p-3 border-0">
              <h6>Total</h6>
              <h5 className="fw-bold text-primary">{members.length}</h5>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="bg-light shadow-sm p-3 border-0">
              <h6>Active</h6>
              <h5 className="fw-bold text-success">{members.filter((m) => m.status === 'Active').length}</h5>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="bg-light shadow-sm p-3 border-0">
              <h6>Expired</h6>
              <h5 className="fw-bold text-danger">{members.filter((m) => m.status === 'Expired').length}</h5>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="bg-light shadow-sm p-3 border-0">
              <h6>Pending</h6>
              <h5 className="fw-bold text-warning">{members.filter((m) => m.status === 'Pending').length}</h5>
            </CCard>
          </CCol>
        </CRow>

        {/* Tabs */}
        <CNav variant="tabs" className="mb-3">
          <CNavItem>
            <CNavLink active={activeKey === 0} onClick={() => setActiveKey(0)}>All</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>Active</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>Expired</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>Pending</CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          <CTabPane visible={activeKey === 0}>{renderTable()}</CTabPane>
          <CTabPane visible={activeKey === 1}>{renderTable()}</CTabPane>
          <CTabPane visible={activeKey === 2}>{renderTable()}</CTabPane>
          <CTabPane visible={activeKey === 3}>{renderTable()}</CTabPane>
        </CTabContent>

        {/* Add/Edit Modal */}
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader><CModalTitle>{isEditMode ? 'Edit Member' : 'Add Member'}</CModalTitle></CModalHeader>

          <form onSubmit={handleAddOrUpdate}>
            <CModalBody>
              <CRow className="g-3">
                <CCol md={12}>
                  <CFormInput label="Member Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} invalid={!!errors.name} />
                  {errors.name && <div className="text-danger mt-1">{errors.name}</div>}
                </CCol>

                <CCol md={6}>
                  <CFormSelect label="Membership Type" value={form.membership} onChange={(e) => setForm({ ...form, membership: e.target.value })} invalid={!!errors.membership}>
                    <option value="">Select Type</option>
                    {membershipOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </CFormSelect>
                  {errors.membership && <div className="text-danger mt-1">{errors.membership}</div>}
                </CCol>

                <CCol md={6}>
                  <CFormInput label="Expiry (YYYY-MM-DD)" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} invalid={!!errors.expiry} />
                  {errors.expiry && <div className="text-danger mt-1">{errors.expiry}</div>}
                </CCol>

                <CCol md={12}>
                  <CFormSelect label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Active</option>
                    <option>Expired</option>
                    <option>Pending</option>
                  </CFormSelect>
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
          <CModalHeader><CModalTitle>Member Details</CModalTitle></CModalHeader>
          <CModalBody>
            {selectedMember && (
              <div>
                <p><strong>Name:</strong> {selectedMember.name}</p>
                <p><strong>Membership:</strong> {selectedMember.membership}</p>
                <p><strong>Expiry:</strong> {selectedMember.expiry}</p>
                <p><strong>Status:</strong> <CBadge color={getBadgeColor(selectedMember.status)}>{selectedMember.status}</CBadge></p>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setViewModalVisible(false)}>Close</CButton>
            <CButton color="primary" onClick={() => { setViewModalVisible(false); if (selectedMember) openEditModal(selectedMember) }}>Edit</CButton>
          </CModalFooter>
        </CModal>

        {/* Delete Modal */}
        <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
          <CModalHeader><CModalTitle>Confirm Delete</CModalTitle></CModalHeader>
          <CModalBody>Are you sure you want to delete this member?</CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>Cancel</CButton>
            <CButton color="danger" onClick={handleDelete}>Delete</CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  )
}

export default MembershipManagement
