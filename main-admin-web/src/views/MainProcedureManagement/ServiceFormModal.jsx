// ServiceFormModal.jsx
import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CRow,
  CCol,
  CFormInput,
  CFormText,
  CFormSelect,
  CFormTextarea,
  CButton, CInputGroup, CInputGroupText
} from '@coreui/react'

import { cilChevronBottom } from '@coreui/icons'
import ProcedureQA from './QASection'
import CIcon from '@coreui/icons-react'

const ServiceFormModal = ({
  visible,
  mode, // 'add' | 'edit'
  onClose,
  onSave,
  onUpdate,
  saveloading,
  newService,
  errors,
  isProcedure,
  onChange,
  onSubServiceChange,
}) => {
  const isEdit = mode === 'edit'
  const [procedureSearch, setProcedureSearch] = useState('')
  const [showProcedureList, setShowProcedureList] = useState(false)

  // 🔹 Detect typing vs selected value
  const isTyping =
    procedureSearch &&
    !isProcedure?.some(
      (p) => p.procedureName === procedureSearch
    )

  // 🔹 Filter logic (CORE FIX)
  const filteredProcedures = isTyping
    ? isProcedure?.filter((procedure) =>
        procedure.procedureName
          .toLowerCase()
          .includes(procedureSearch.toLowerCase())
      )
    : isProcedure

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      backdrop="static"
      className="custom-modal"
    >
      <CModalHeader>
        <CModalTitle style={{ textAlign: 'center', width: '100%' }}>
          {isEdit ? 'Edit Procedure Details' : 'Add New Procedure Details'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        <CForm>
          {/* Procedure Name + Price + Discount + GST */}
          <CRow>
          <CCol md={3} className="mb-4 position-relative">
              <h6>
                Procedure Name <span className="text-danger">*</span>
              </h6>

              <CInputGroup>
                <CFormInput
                  placeholder="Select procedure"
                  value={procedureSearch}
                  disabled={isEdit}
                  onChange={(e) => {
                    setProcedureSearch(e.target.value)
                    setShowProcedureList(true)
                  }}
                  onFocus={() => setShowProcedureList(true)}
                />

                <CInputGroupText
                  style={{
                    cursor: 'pointer',
                    color: showProcedureList ? '#0d6efd' : '#6c757d',
                    transform: showProcedureList ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setShowProcedureList((prev) => !prev)}
                >
                  <CIcon icon={cilChevronBottom} />
                </CInputGroupText>
              </CInputGroup>

              {showProcedureList && filteredProcedures?.length > 0 && (
                <div
                  className="border rounded bg-white shadow-sm position-absolute w-100"
                  style={{
                    zIndex: 1050,
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  {filteredProcedures.map((procedure) => (
                    <div
                      key={procedure.procedureId}
                      className="px-3 py-2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setProcedureSearch(procedure.procedureName)
                        setShowProcedureList(false)
                        onSubServiceChange({
                          target: {
                            name: 'subServiceId',
                            value: procedure.procedureId,
                          },
                        })
                      }}
                    >
                      {procedure.procedureName}
                    </div>
                  ))}
                </div>
              )}

              {errors.subServiceName && (
                <CFormText className="text-danger">
                  {errors.subServiceName}
                </CFormText>
              )}
            </CCol>
            <CCol md={3} className="mb-4">
              <h6>
                Procedure Price <span className="text-danger">*</span>
              </h6>
              <CFormInput
                type="text"
                placeholder="Procedure Price"
                name="price"
                value={newService.price || ''}
                onChange={onChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '')
                }}
              />
              {errors.price && <CFormText className="text-danger">{errors.price}</CFormText>}
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>Discount / Offer (%)</h6>
              <CFormInput
                type="text"
                name="discount"
                placeholder="Discount"
                value={newService.discount || ''}
                onChange={onChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '')
                }}
              />
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>GST (%)</h6>
              <CFormInput
                type="text"
                name="gst"
                placeholder="GST (%)"
                value={newService.gst || ''}
                onChange={onChange}
              />
            </CCol>
          </CRow>

          {/* Taxes, Offers, Sittings */}
          <CRow>
            <CCol md={3} className="mb-4">
              <h6>Other Taxes (%)</h6>
              <CFormInput
                type="text"
                name="taxPercentage"
                placeholder="Tax Percentage"
                value={newService.taxPercentage || ''}
                onChange={onChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '')
                }}
              />
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>Offer Start Date</h6>
              <CFormInput
                type="date"
                name="offerValidDate"
                min={new Date().toISOString().split('T')[0]}
                value={newService.offerValidDate || ''}
                onChange={onChange}
              />
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>Offer End Date</h6>
              <CFormInput
                type="date"
                name="offerEndDate"
                min={new Date().toISOString().split('T')[0]}
                value={newService.offerEndDate || ''}
                onChange={onChange}
              />
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>
                No of Sittings <span className="text-danger">*</span>
              </h6>
              <CFormInput
                type="text"
                name="sittings"
                value={newService.sittings || ''}
                onChange={onChange}
                placeholder="Enter no of sittings"
              />
              {errors.sittings && (
                <CFormText className="text-danger">{errors.sittings}</CFormText>
              )}
            </CCol>
          </CRow>

          {/* Consultation Fee + Min Time + Image + Description */}
          <CRow>
            <CCol md={3} className="mb-4">
              <h6>
                Consultation Fee <span className="text-danger">*</span>
              </h6>
              <CFormInput
                type="text"
                name="consultationFee"
                value={newService.consultationFee || ''}
                onChange={onChange}
                placeholder="Enter Consultation Fee"
              />
              {errors.consultationFee && (
                <CFormText className="text-danger">{errors.consultationFee}</CFormText>
              )}
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>
                Min Time <span className="text-danger">*</span>
              </h6>
              <div className="d-flex">
                <CFormInput
                  type="text"
                  name="minTimeValue"
                  placeholder="Enter time"
                  value={newService.minTimeValue || ''}
                  onChange={onChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '')
                  }}
                />
                <CFormSelect
                  name="minTimeUnit"
                  className="ms-2"
                  value={newService.minTimeUnit || ''}
                  onChange={onChange}
                >
                  <option value="" disabled>
                    Select Time
                  </option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                </CFormSelect>
              </div>
              {errors.minTimeValue && (
                <CFormText className="text-danger">{errors.minTimeValue}</CFormText>
              )}
              {errors.minTimeUnit && (
                <CFormText className="text-danger">{errors.minTimeUnit}</CFormText>
              )}
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>
                Procedure Image <span className="text-danger">*</span>
              </h6>
              <CFormInput
                type="file"
                accept="image/*"
                name="serviceImage"
                onChange={onChange}
              />
              {newService?.serviceImage && (
                <img
                  src={
                    newService.serviceImage.startsWith('data:')
                      ? newService.serviceImage
                      : `data:image/jpeg;base64,${newService.serviceImage}`
                  }
                  alt="Preview"
                  style={{ width: 100, height: 100, marginTop: 10, objectFit: 'cover' }}
                />
              )}
              {errors.serviceImage && (
                <CFormText className="text-danger">{errors.serviceImage}</CFormText>
              )}
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>
                View Description <span className="text-danger">*</span>
              </h6>
              <CFormTextarea
                type="text"
                placeholder="View Description"
                name="viewDescription"
                value={newService.viewDescription || ''}
                onChange={onChange}
              />
              {errors.viewDescription && (
                <CFormText className="text-danger">{errors.viewDescription}</CFormText>
              )}
            </CCol>
            <CCol md={6} className="mb-4">
              <h6>Procedure Video Link</h6>
              <CFormInput
                type="url"
                placeholder="Enter procedure video URL (YouTube, Vimeo, Drive, etc.)"
                value={newService.procedureLink || ''}
                name="procedureLink"
                onChange={onChange}
              />
              {newService.procedureLink && (
                <CButton
                  color="primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open(newService.procedureLink, '_blank')}
                >
                  Watch Procedure Video
                </CButton>
              )}
            </CCol>


            {isEdit && (
              <CCol md={6} className="mb-4">
                <h6>NGK Discount Percentage</h6>

                <CInputGroup>
                  <CFormInput
                    type="number"
                    placeholder="NGK Discount"
                    name="ngkDiscountAmount"
                    value={newService.ngkDiscountAmount || 'N/A'}
                    onChange={onChange}
                    min={0}
                  />
                  <CInputGroupText>%</CInputGroupText>
                </CInputGroup>
              </CCol>
            )}
          </CRow>

          {/* QA Section */}
          <h6 className="mt-3">Procedure (Optional)</h6>
          <ProcedureQA
            preQAList={newService.preProcedureQA}
            setPreQAList={(data) =>
              onChange({ target: { name: 'preProcedureQA', value: data, type: 'text' } })
            }
            procedureQAList={newService.procedureQA}
            setProcedureQAList={(data) =>
              onChange({ target: { name: 'procedureQA', value: data, type: 'text' } })
            }
            postQAList={newService.postProcedureQA}
            setPostQAList={(data) =>
              onChange({ target: { name: 'postProcedureQA', value: data, type: 'text' } })
            }
          />
        </CForm>
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton
          color="info"
          className="pink-Btn"
          onClick={isEdit ? onUpdate : onSave}
          disabled={saveloading}
        >
          {saveloading && (
            <span className="spinner-border text-white spinner-border-sm me-2"></span>
          )}
          {saveloading ? (isEdit ? 'Updating...' : 'Saving...') : isEdit ? 'Update' : 'Save'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ServiceFormModal
