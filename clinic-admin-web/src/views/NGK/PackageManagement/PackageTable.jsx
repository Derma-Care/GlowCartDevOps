/* eslint-disable react/prop-types */
// PackageTablData.jsx
import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { Eye, Edit2, Trash2 } from 'lucide-react'
import capitalizeWords from '../Utills/capitalizeWords'

const PackageTableData = ({ data, canRead, canUpdate, canDelete, onView, onEdit, onDelete }) => {
  return (
    <CTable striped hover responsive>
      <CTableHead className="pink-table w-auto">
        <CTableRow>
          <CTableHeaderCell style={{ paddingLeft: '40px' }}>S.No</CTableHeaderCell>
          <CTableHeaderCell>Package Name</CTableHeaderCell>
          <CTableHeaderCell>Discount %</CTableHeaderCell>
          <CTableHeaderCell>Offer Start Date</CTableHeaderCell>
          <CTableHeaderCell>Offer End Date</CTableHeaderCell>
          <CTableHeaderCell>Price</CTableHeaderCell>
          <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>

      <CTableBody className="pink-table">
        {data.length > 0 ? (
          data.map((item, index) => (
            <CTableRow key={item.procedureId || index}>
              <CTableDataCell style={{ paddingLeft: '40px' }}>{index + 1}</CTableDataCell>
              <CTableDataCell>{capitalizeWords(item.packageName || 'N/A')}</CTableDataCell>
              <CTableDataCell>{item.discountPercentage ?? 'NA'}</CTableDataCell>
              {/* <CTableDataCell>
                {item.offerEndDate ? new Date(item.offerEndDate).toLocaleDateString('en-GB') : 'NA'}
              </CTableDataCell> */}
              <CTableDataCell>
                {item.offerStart ? new Date(item.offerStart).toLocaleDateString('en-GB') : 'NA'}
              </CTableDataCell>
              <CTableDataCell>
                {item.offerValidDate
                  ? new Date(item.offerValidDate).toLocaleDateString('en-GB')
                  : 'NA'}
              </CTableDataCell>

              <CTableDataCell>₹{item.price || 'NA'}</CTableDataCell>

              <CTableDataCell className="text-end">
                <div className="d-flex justify-content-end gap-2">
                  {canRead && (
                    <button className="actionBtn" onClick={() => onView(item)} title="View">
                      <Eye size={18} />
                    </button>
                  )}

                  {canUpdate && (
                    <button className="actionBtn" onClick={() => onEdit(item)} title="Edit">
                      <Edit2 size={18} />
                    </button>
                  )}

                  {canDelete && (
                    <button className="actionBtn" onClick={() => onDelete(item)} title="Delete">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </CTableDataCell>
            </CTableRow>
          ))
        ) : (
          <CTableRow>
            <CTableDataCell colSpan={6} className="text-center text-muted">
              🔍 No Packages Found
            </CTableDataCell>
          </CTableRow>
        )}
      </CTableBody>
    </CTable>
  )
}

export default PackageTableData
