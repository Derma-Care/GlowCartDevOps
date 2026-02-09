import React, { useState, useMemo } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CNav,
  CNavItem,
  CNavLink,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CPagination,
  CPaginationItem,
  CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { Eye } from 'lucide-react'
import { MEMBERSHIP_DATA } from './MembershipData'
import MembershipViewModal from './MembershipViewModal'

const MembershipTable = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeStatusTab, setActiveStatusTab] = useState('All')

  // Filter by status
  const statusFilteredData = useMemo(() => {
    if (activeStatusTab === 'All') return MEMBERSHIP_DATA
    return MEMBERSHIP_DATA.filter(
      (member) => member.status.toLowerCase() === activeStatusTab.toLowerCase()
    )
  }, [activeStatusTab])

  // Global search
  const searchedData = useMemo(() => {
    if (!searchTerm) return statusFilteredData
    return statusFilteredData.filter((member) =>
      Object.values(member).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, statusFilteredData])

  // Pagination calculated
  const totalPages = Math.ceil(searchedData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedData = searchedData.slice(startIndex, endIndex)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* STATUS TABS */}
        <CNav variant="tabs">
          {['All', 'Active', 'InActive', 'Expired'].map((status) => (
            <CNavItem key={status}>
              <CNavLink
                active={activeStatusTab === status}
                onClick={() => {
                  setActiveStatusTab(status)
                  setCurrentPage(1)
                }}
                style={{ cursor: 'pointer' }}
              >
                {status}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>

        {/* SEARCH */}
        <CInputGroup style={{ width: '300px' }}>
          <CFormInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            style={{ border: '1px solid var(--color-black)', height: '40px' }}
          />
          <CInputGroupText style={{ border: '1px solid var(--color-black)', height: '40px' }}>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
        </CInputGroup>
      </div>

      {/* TABLE */}
      <CTable striped hover responsive>
        <CTableHead className="pink-table">
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Phone</CTableHeaderCell>
            <CTableHeaderCell>Coins</CTableHeaderCell>
            <CTableHeaderCell>Membership</CTableHeaderCell>
            <CTableHeaderCell>Referral Code</CTableHeaderCell>
            <CTableHeaderCell>Joined</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody className="pink-table">
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => (
              <CTableRow key={item.id || index}>
                <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                <CTableDataCell>{item.name}</CTableDataCell>
                <CTableDataCell>{item.phone}</CTableDataCell>
                <CTableDataCell>{item.coins.toLocaleString()}</CTableDataCell>
                <CTableDataCell>
                  <span className={`tag ${item.membership.toLowerCase()}`}>{item.membership}</span>
                </CTableDataCell>
                <CTableDataCell>{item.referralCode}</CTableDataCell>
                <CTableDataCell>{new Date(item.joined).toLocaleDateString('en-GB')}</CTableDataCell>
                <CTableDataCell>
                  <button className="actionBtn" onClick={() => setSelectedMember(item)}>
                    <Eye size={18} />
                  </button>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={10} className="text-center text-muted">
                🔍 No Membership Data Found
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {/* PAGINATION SECTION */}
      {searchedData.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          {/* ROWS PER PAGE */}
          <div>
            <label className="me-2">Rows per page:</label>
            <CFormSelect
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
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

          {/* PAGE DETAILS + PAGINATION */}
          <div>
            <div>
              Showing {startIndex + 1} to {Math.min(endIndex, searchedData.length)} of{' '}
              {searchedData.length} entries
            </div>

            <CPagination align="end" className="mt-2 themed-pagination">
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </CPaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 5) return true
                  if (currentPage <= 3) return page <= 5
                  if (currentPage >= totalPages - 2) return page >= totalPages - 4
                  return page >= currentPage - 2 && page <= currentPage + 2
                })
                .map((page) => (
                  <CPaginationItem
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </CPaginationItem>
                ))}

              <CPaginationItem
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </CPaginationItem>
            </CPagination>
          </div>
        </div>
      )}

      {/* MODAL VIEW */}
      {selectedMember && (
        <MembershipViewModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  )
}

export default MembershipTable
