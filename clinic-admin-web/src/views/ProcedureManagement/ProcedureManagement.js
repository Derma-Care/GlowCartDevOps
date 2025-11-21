import React, { useEffect, useState } from 'react'
import {
  CFormInput,
  CFormSelect,
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
  CCardHeader,
} from '@coreui/react'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

/* ✅ USE PROCEDURE APIs */
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
  const [showModal, setShowModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [selectedProcedure, setSelectedProcedure] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editProcedureId, setEditProcedureId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [errors, setErrors] = useState({ procedure: '' })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    fetchProcedures()
  }, [])

  /* ======================================================
      GET ALL PROCEDURES
  ====================================================== */
  const fetchProcedures = async () => {
    setLoading(true)
    try {
      const response = await getAllProcedures()

      const formatted = response.map((proc) => ({
        id: proc.procedureId,
        name: proc.procedureName,
      }))

      setProcedures(formatted)
    } catch (error) {
      toast.error('Failed to fetch procedures')
    }
    setLoading(false)
  }

  /* ======================================================
      ADD / UPDATE PROCEDURE
  ====================================================== */
  const handleSubmit = async () => {
    const trimmed = procedureInput.trim()
    if (!trimmed) {
      setErrors({ procedure: 'Procedure name is required' })
      return
    }

    const duplicate = procedures.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase() && p.id !== editProcedureId
    )
    if (duplicate) {
      setErrors({ procedure: 'Procedure already exists' })
      return
    }

    try {
      const payload = { procedureName: trimmed }

      let res
      if (editMode) {
        res = await updateProcedure(editProcedureId, payload)
        toast.success('Procedure updated successfully')
      } else {
        res = await createProcedure(payload)
        toast.success('Procedure added successfully')
      }

      fetchProcedures()
      setProcedureInput('')
      setErrors({ procedure: '' })
      setEditMode(false)
      setEditProcedureId(null)
      setShowModal(false)
    } catch (error) {
      toast.error('Failed to save procedure')
    }
  }

  /* ======================================================
      VIEW PROCEDURE
  ====================================================== */
  const handleView = (procedure) => {
    setSelectedProcedure(procedure)
    setViewModal(true)
  }

  /* ======================================================
      EDIT PROCEDURE
  ====================================================== */
  const handleEdit = (procedure) => {
    setEditMode(true)
    setEditProcedureId(procedure.id)
    setProcedureInput(procedure.name)
    setShowModal(true)
  }

  /* ======================================================
      DELETE PROCEDURE
  ====================================================== */
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

  /* ======================================================
      PAGINATION
  ====================================================== */
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = procedures.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(procedures.length / itemsPerPage)

  return (
    <>
      <ToastContainer />

      <CCard className="mt-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0" style={{ color: COLORS.black }}>
              Procedure Management
            </h4>

            <CButton
              color="secondary"
              style={{ backgroundColor: COLORS.black, color: COLORS.white }}
              onClick={() => {
                setEditMode(false)
                setProcedureInput('')
                setShowModal(true)
              }}
            >
              + Add New Procedure
            </CButton>
          </div>
        </CCardHeader>

        {loading ? (
          <LoadingIndicator message="Fetching Procedure Details, Please wait..." />
        ) : (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>S.No</CTableHeaderCell>
                <CTableHeaderCell>Procedure</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {currentItems.length > 0 ? (
                currentItems.map((row, index) => (
                  <CTableRow key={row.id}>
                    <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                    <CTableDataCell>{row.name}</CTableDataCell>
                    <CTableDataCell className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button className="actionBtn" onClick={() => handleView(row)}>
                          <Eye size={18} />
                        </button>

                        <button className="actionBtn" onClick={() => handleEdit(row)}>
                          <Edit2 size={18} />
                        </button>

                        <button className="actionBtn" onClick={() => confirmDelete(row.id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={3} className="text-center">
                    No procedures found
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}

        {/* Pagination */}
        {procedures.length > 0 && (
          <div className="d-flex justify-content-between px-3 pb-3 mt-3">
            <div>
              <label className="me-2">Rows per page:</label>
              <CFormSelect
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                style={{ width: '80px' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </CFormSelect>
            </div>

            <div>
              <div>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, procedures.length)} of{' '}
                {procedures.length} entries
              </div>

              <CPagination align="end">
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </CPaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <CPaginationItem
                    active={i + 1 === currentPage}
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
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
      </CCard>

      {/* Add/Edit Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>{editMode ? 'Edit Procedure' : 'Add New Procedure'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            placeholder="Enter Procedure Name"
            value={procedureInput}
            onChange={(e) => {
              setProcedureInput(e.target.value)
              if (e.target.value.trim()) setErrors({ procedure: '' })
            }}
            invalid={!!errors.procedure}
          />
          {errors.procedure && <p className="text-danger mt-1">{errors.procedure}</p>}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            {editMode ? 'Update' : 'Add'}
          </CButton>
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

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <ConfirmationModal
          isVisible={showDeleteModal}
          message="Are you sure you want to delete this procedure?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}

export default ProcedureManagement
