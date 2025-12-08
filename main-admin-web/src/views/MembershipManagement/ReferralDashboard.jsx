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
  CFormInput,CInputGroupText,CInputGroup
} from '@coreui/react'
import { Eye } from 'lucide-react'
import { MEMBERSHIP_DATA } from './MembershipData'
import Pagination from '../../Utils/Pagination'
import MembershipViewModal from './MembershipViewModal'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
const MembershipTable = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeStatusTab, setActiveStatusTab] = useState('All') // Status tab filter

  // Filter data by status tab
  const statusFilteredData = useMemo(() => {
    if (activeStatusTab === 'All') return MEMBERSHIP_DATA
    return MEMBERSHIP_DATA.filter(
      (member) => member.status.toLowerCase() === activeStatusTab.toLowerCase()
    )
  }, [activeStatusTab])

  // Apply global search
  const searchedData = useMemo(() => {
    if (!searchTerm) return statusFilteredData
    return statusFilteredData.filter((member) =>
      Object.values(member).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, statusFilteredData])

  // Apply pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    const end = start + rowsPerPage
    return searchedData.slice(start, end)
  }, [currentPage, rowsPerPage, searchedData])

  return (
    <div>
   <div className="d-flex justify-content-between align-items-center mb-3">
  {/* STATUS TABS on left */}
  <CNav variant="tabs">
    {['All', 'Active', 'InActive', 'Expired'].map((status) => (
      <CNavItem key={status}>
        <CNavLink
          active={activeStatusTab === status}
          onClick={() => {
            setActiveStatusTab(status)
            setCurrentPage(1) // Reset page on tab change
          }}
          style={{ cursor: 'pointer' }}
        >
          {status}
        </CNavLink>
      </CNavItem>
    ))}
  </CNav>

  {/* GLOBAL SEARCH on right */}
  <CInputGroup style={{ width: '300px' }}>
    <CFormInput
      type="text"
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
      }}
      style={{ height: '40px', border: "1px solid #7e3a93" }}
    />
    <CInputGroupText style={{ height: '40px', border: "1px solid #7e3a93" }}>
      <CIcon icon={cilSearch} />
    </CInputGroupText>
  </CInputGroup>
</div>




      {/* TABLE */}
      <CTable striped hover responsive>
        <CTableHead className="pink-table w-auto">
          <CTableRow>
            <CTableHeaderCell style={{ paddingLeft: '40px' }}>S.No</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Phone</CTableHeaderCell>
            <CTableHeaderCell>Coins</CTableHeaderCell>
            <CTableHeaderCell>Membership</CTableHeaderCell>
            <CTableHeaderCell>Referral Code</CTableHeaderCell>
            <CTableHeaderCell>Joined</CTableHeaderCell>
            <CTableHeaderCell>Expiry</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody className="pink-table">
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => (
              <CTableRow key={item.id || index}>
                <CTableDataCell style={{ paddingLeft: '40px' }}>
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </CTableDataCell>

                <CTableDataCell>{item.name}</CTableDataCell>
                <CTableDataCell>{item.phone}</CTableDataCell>
                <CTableDataCell>{item.coins.toLocaleString()}</CTableDataCell>

                <CTableDataCell>
                  <span className={`tag ${item.membership.toLowerCase()}`}>{item.membership}</span>
                </CTableDataCell>

                <CTableDataCell>{item.referralCode}</CTableDataCell>
                <CTableDataCell>{new Date(item.joined).toLocaleDateString('en-GB')}</CTableDataCell>
                <CTableDataCell>{new Date(item.expiry).toLocaleDateString('en-GB')}</CTableDataCell>

                <CTableDataCell>
                  <span
                    className={item.status === 'Active' ? 'status active' : 'status expired'}
                    style={{ color: item.status === 'Active' ? 'green' : 'red' }}
                  >
                    {item.status}
                  </span>
                </CTableDataCell>

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

      {/* PAGINATION */}
      {searchedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(searchedData.length / rowsPerPage)}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setRowsPerPage}
        />
      )}

      {/* VIEW MODAL */}
      {selectedMember && (
        <MembershipViewModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  )
}

export default MembershipTable
