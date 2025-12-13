import React, { useEffect, useState } from 'react'
import {
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CCard,
  CCardHeader, CFormSelect
} from '@coreui/react'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  createProcedure,
  getAllProcedures,
  updateProcedure,
  deleteProcedure,
} from './ProcedureAPI'

import LoadingIndicator from '../../Utils/loader'
import { ConfirmationModal } from '../../Utils/ConfirmationDelete'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import { COLORS } from '../../Constant/Themes'

const ProcedureManagement = () => {
  const [procedures, setProcedures] = useState([])
  const [procedureInput, setProcedureInput] = useState('')
  const [tempProcedures, setTempProcedures] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [selectedProcedure, setSelectedProcedure] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editProcedureId, setEditProcedureId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [errors, setErrors] = useState({ procedure: '' })
  const [searchTerm, setSearchTerm] = useState('')
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    fetchProcedures()
  }, [])

  const fetchProcedures = async () => {
    setLoading(true)
    try {
      const response = await getAllProcedures()
      const formatted = response.map((proc) => ({ id: proc.procedureId, name: proc.procedureName }))
      setProcedures(formatted)
    } catch (error) {
      toast.error('Failed to fetch procedures')
    }
    setLoading(false)
  }

  /* ===========================
      ADD PROCEDURE TO TEMP LIST
     =========================== */
  const handleAddToTemp = () => {
    const trimmed = procedureInput.trim()
    if (!trimmed) {
      setErrors({ procedure: 'Procedure name is required' })
      return
    }

    if (tempProcedures.map(p => p.toLowerCase()).includes(trimmed.toLowerCase())) {
      setErrors({ procedure: 'Procedure already added in the list' })
      return
    }

    setTempProcedures([...tempProcedures, trimmed])
    setProcedureInput('')
    setErrors({ procedure: '' })
  }

  /* ===========================
      SUBMIT ALL TEMP PROCEDURES
     =========================== */
  const handleSubmitAll = async () => {
    let successCount = 0;
    let failCount = 0;
    let failedItems = [];

    for (const name of tempProcedures) {
      try {
        const res = await createProcedure({ procedureName: name });

        if (res && res.success !== false) {
          successCount++;
        } else {
          failCount++;
          failedItems.push(name);
        }
      } catch (err) {
        failCount++;
        failedItems.push(name);
      }
    }

    // Show ONLY ONE toast message
    if (successCount > 0 && failCount === 0) {
      toast.success(`${successCount} procedures added successfully`);
    }
    else if (successCount > 0 && failCount > 0) {
      toast.warn(
        `${successCount} added successfully, ${failCount} failed: ${failedItems.join(", ")}`
      );
    }
    else {
      toast.error(`Failed to add procedures: ${failedItems.join(", ")}`);
    }

    fetchProcedures();
    setTempProcedures([]);
    setShowModal(false);
  };

  const handleView = (procedure) => {
    setSelectedProcedure(procedure)
    setViewModal(true)
  }

  const handleEdit = (procedure) => {
    setEditMode(true)
    setEditProcedureId(procedure.id)
    setProcedureInput(procedure.name)
    setShowModal(true)
  }

  const confirmDelete = (id) => {
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteProcedure(deleteId)
      toast.success('Procedure deleted successfully')
      fetchProcedures()
    } catch {
      toast.error('Failed to delete procedure')
    }
    setShowDeleteModal(false)
  }
  const filteredProcedures = procedures.filter((proc) =>
    proc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProcedures.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProcedures.length / itemsPerPage)


  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      <ToastContainer />

      <CCard className="mt-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <h4 className="mb-0" style={{ color: COLORS.black }}>
              Procedure Management
            </h4>

            <div className="d-flex align-items-center gap-2">
              {/* Global Search */}
              <CFormInput
                placeholder="Search procedure..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                style={{ width: '220px' }}
              />

              {/* Add Button */}
              <CButton
                color="secondary"
                style={{ backgroundColor: COLORS.black, color: COLORS.white }}
                onClick={() => {
                  setEditMode(false)
                  setProcedureInput('')
                  setTempProcedures([])
                  setShowModal(true)
                }}
              >
                + Add New Procedure
              </CButton>
            </div>
          </div>

        </CCardHeader>

        {loading ? (
          <LoadingIndicator message="Fetching Procedure Details, Please wait..." />
        ) : (
          <CTable striped hover responsive >
            <CTableHead className='pink-table'>
              <CTableRow>
                <CTableHeaderCell className="text-center" style={{ width: "10%" }}>S.No</CTableHeaderCell>
                <CTableHeaderCell className="text-center" style={{ width: "60%" }}>Procedure</CTableHeaderCell>
                <CTableHeaderCell className="text-center" style={{ width: "30%" }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody className='pink-table'>
              {currentItems.length > 0 ? (
                currentItems.map((row, index) => (
                  <CTableRow key={row.id}>
                    <CTableDataCell className="text-center">{indexOfFirstItem + index + 1}</CTableDataCell>
                    <CTableDataCell className="text-center">{row.name}</CTableDataCell>
                    <CTableDataCell className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button className="actionBtn" onClick={() => handleView(row)}><Eye size={18} /></button>
                        <button className="actionBtn" onClick={() => handleEdit(row)}><Edit2 size={18} /></button>
                        <button className="actionBtn" onClick={() => confirmDelete(row.id)}><Trash2 size={18} /></button>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={3} className="text-center">No procedures found</CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

        )}

        {procedures.length > 0 && (
          <div className="d-flex justify-content-between px-3 pb-3 mt-3">
            <div>
              <label className="me-2">Rows per page:</label>
              <CFormSelect
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{ width: '80px', display: 'inline-block' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </CFormSelect>
            </div>

            <div>
              <div>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProcedures.length)} of {filteredProcedures.length} entries
              </div>

              <CPagination align="end">
                <CPaginationItem disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Previous</CPaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 5) return true;
                    if (currentPage <= 3) return page <= 5;
                    if (currentPage >= totalPages - 2)
                      return page >= totalPages - 4;
                    return page >= currentPage - 2 && page <= currentPage + 2;
                  })
                  .map((page) => (
                    <CPaginationItem
                      key={page}
                      active={page === currentPage}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </CPaginationItem>
                  ))}
                <CPaginationItem disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next</CPaginationItem>
              </CPagination>
            </div>
          </div>
        )}
      </CCard>

      {/* Add Procedures Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Add Procedures</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CFormInput
            placeholder="Enter procedure"
            value={procedureInput}
            onChange={(e) => setProcedureInput(e.target.value)}
            invalid={!!errors.procedure}
          />
          {errors.procedure && <p className="text-danger mt-1">{errors.procedure}</p>}<br />

          <CButton color="primary" onClick={handleAddToTemp}>Add</CButton>

          {tempProcedures.length > 0 && (
            <div className="mt-3">
              <h6>Procedures to be added:</h6>
              <ul>{tempProcedures.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSubmitAll} disabled={tempProcedures.length === 0}>Submit All</CButton>
        </CModalFooter>
      </CModal>

      {/* View Modal */}
      <CModal visible={viewModal} onClose={() => setViewModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Procedure Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p><strong>ID:</strong> {selectedProcedure?.id}</p>
          <p><strong>Name:</strong> {selectedProcedure?.name}</p>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={() => setViewModal(false)}>Close</CButton>
        </CModalFooter>
      </CModal>


      <ConfirmationModal
        isVisible={showDeleteModal}
        message="Are you sure you want to delete this procedure?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

    </>
  )
}

export default ProcedureManagement