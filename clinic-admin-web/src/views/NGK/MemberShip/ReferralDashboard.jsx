import React, { useState, useMemo } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { Eye } from 'lucide-react'
import { MEMBERSHIP_DATA } from './MembershipData'
import Pagination from '../../../Utils/Pagination'
import MembershipViewModal from '../MemberShip/MembershipViewModal'

const MembershipTable = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedMember, setSelectedMember] = useState(null)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    const end = start + rowsPerPage
    return MEMBERSHIP_DATA.slice(start, end)
  }, [currentPage, rowsPerPage])

  return (
    <div>
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
                  <span className={item.status === 'Active' ? 'status active' : 'status expired'} style={{color:item.status === 'Active' ? 'green' : 'red'}}>
                    {item.status}
                  </span>
                </CTableDataCell>

                {/* VIEW BUTTON */}
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
      {MEMBERSHIP_DATA.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(MEMBERSHIP_DATA.length / rowsPerPage)}
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
