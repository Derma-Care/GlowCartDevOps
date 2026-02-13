import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CPagination,
  CPaginationItem,
  CFormSelect,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { Eye } from 'lucide-react'
import MembershipViewModal from './MembershipViewModal'
import { BASE_URL_API, CustomerAllData } from '../../baseUrl'


const MembershipTable = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // 📡 Fetch API Data
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${BASE_URL_API}/${CustomerAllData}`)
        setData(res.data?.data || res.data || [])
      } catch (err) {
        setError('Failed to load membership data')
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  // 🔍 Global Search
  const searchedData = useMemo(() => {
    if (!searchTerm) return data
    return data.filter((member) =>
      Object.values(member).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, data])

  // 📄 Pagination
  const totalPages = Math.ceil(searchedData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedData = searchedData.slice(startIndex, endIndex)

  return (
    <div>
      {/* 🔍 SEARCH */}
      <div className="d-flex justify-content-end mb-3">
        <CInputGroup style={{ width: '300px' }}>
          <CFormInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
        </CInputGroup>
      </div>

      {/* ⏳ LOADING */}
      {loading && (
        <div className="text-center py-4">
          <CSpinner />
        </div>
      )}

      {/* ❌ ERROR */}
      {error && <div className="text-danger text-center">{error}</div>}

      {/* 📋 TABLE */}
      {!loading && !error && (
        <CTable striped hover responsive>
          <CTableHead className="pink-table">
            <CTableRow className="text-center">
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
                <CTableRow
                  key={item.customerId}
                  className="text-center align-middle"
                >
                  <CTableDataCell>{startIndex + index + 1}</CTableDataCell>

                  <CTableDataCell>{item.fullName}</CTableDataCell>

                  <CTableDataCell>{item.mobile}</CTableDataCell>

                  <CTableDataCell>
                    {item.walletSummary?.balance ?? 0}
                  </CTableDataCell>

                  <CTableDataCell>
                    <span className={`tag ${item.walletSummary?.membership?.toLowerCase()}`}>
                      {item.walletSummary?.membership || '-'}
                    </span>
                  </CTableDataCell>

                  <CTableDataCell>{item.referId || '-'}</CTableDataCell>

                  <CTableDataCell>
                    {item.dob
                      ? new Date(item.dob).toLocaleDateString('en-GB')
                      : '-'}
                  </CTableDataCell>

                  <CTableDataCell>
                    <button
                      className="actionBtn"
                      onClick={() => setSelectedMember(item)}
                    >
                      <Eye size={18} />
                    </button>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={8} className="text-center text-muted">
                  🔍 No Customer Data Found
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>

        </CTable>
      )}

      {/* 📑 PAGINATION */}
      {!loading && searchedData.length > 0 && (
        <div className="d-flex justify-content-between px-3 py-3">
          <div>
            Rows per page:
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(+e.target.value)
                setCurrentPage(1)
              }}
             className="form-select form-select-sm d-inline ms-2"
                style={{ width: "80px" }}
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <CPagination className="themed-pagination">
            <CPaginationItem
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </CPaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
      )}

      {/* 👁️ MODAL */}
      {selectedMember && (
        <MembershipViewModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  )
}

export default MembershipTable
