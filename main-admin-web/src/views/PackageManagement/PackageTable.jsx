// PackageTableData.jsx
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
import capitalizeWords from '../../Utils/capitalizeWords'

const PackageTableData = ({ data, onView, onEdit, onDelete }) => {
  return (
    <CTable striped hover responsive>
      <CTableHead className="pink-table w-auto">
        <CTableRow>
          <CTableHeaderCell style={{ paddingLeft: '40px' }}>S.No</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Package Name</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Discount %</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Offer Start Date</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Offer End Date</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Price</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>

      <CTableBody className="pink-table">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <CTableRow key={item.packageId || index}>
              <CTableDataCell style={{ paddingLeft: '40px' }}>{index + 1}</CTableDataCell>

              <CTableDataCell className="text-center">
                {capitalizeWords(item.packageName || 'N/A')}
              </CTableDataCell>

              <CTableDataCell className="text-center">
                {item.discountPercentage ?? 'NA'}
              </CTableDataCell>

              <CTableDataCell className="text-center">
                {item.offerStart
                  ? new Date(item.offerStart).toLocaleDateString('en-GB')
                  : 'NA'}
              </CTableDataCell>

              <CTableDataCell className="text-center">
                {item.offerValidDate
                  ? new Date(item.offerValidDate).toLocaleDateString('en-GB')
                  : 'NA'}
              </CTableDataCell>

              <CTableDataCell className="text-center">
                ₹{item.price || 'NA'}
              </CTableDataCell>

              <CTableDataCell className="text-center">
                <div className="d-flex justify-content-center gap-2">

           
                    <button className="actionBtn" onClick={() => onView(item)} title="View">
                      <Eye size={18} />
                    </button>
          
                    <button className="actionBtn" onClick={() => onEdit(item)} title="Edit">
                      <Edit2 size={18} />
                    </button>
        
            
                    <button className="actionBtn" onClick={() => onDelete(item)} title="Delete">
                      <Trash2 size={18} />
                    </button>
               

                </div>
              </CTableDataCell>
            </CTableRow>
          ))
        ) : (
          <CTableRow>
            <CTableDataCell colSpan={7} className="text-center text-muted">
              🔍 No packages found
            </CTableDataCell>
          </CTableRow>
        )}
      </CTableBody>
    </CTable>
  )
}

export default PackageTableData
