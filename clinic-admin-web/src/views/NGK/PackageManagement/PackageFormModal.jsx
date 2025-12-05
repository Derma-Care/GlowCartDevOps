// PackageFormModal.jsx
import React from 'react'
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
  CButton,
} from '@coreui/react'
import ProcedureQA from './QASection'
import SearchableSelect from '../Widget/SearchableSelect'

const PackageFormModal = ({
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
          {isEdit ? 'Edit Package Details' : 'Add New Package Details'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        <CForm>
          {/* Procedure Name + Price + Discount + GST */}
          <CRow>
            <CCol md={3} className="mb-4">
              <h6>
                Package Name <span className="text-danger">*</span>
              </h6>
              <CFormInput
                disabled={isEdit}
                type="text"
                placeholder="Package Name"
                name="packageName"
                value={newService.packageName || ''}
                onChange={onChange}
              />
              {errors.packageName && (
                <CFormText className="text-danger">{errors.packageName}</CFormText>
              )}
            </CCol>
            <CCol md={3} className="mb-4">
              <h6>
                Package Price <span className="text-danger">*</span>
              </h6>
              <CFormInput
                type="text"
                placeholder="Package Price"
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
              {errors.discount && <CFormText className="text-danger">{errors.discount}</CFormText>}
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
              {errors.offerValidDate && (
                <CFormText className="text-danger">{errors.offerValidDate}</CFormText>
              )}
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

            {/* <CCol md={3} className="mb-4">
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
            </CCol> */}

            {/* <CCol md={3} className="mb-4">
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
              {errors.sittings && <CFormText className="text-danger">{errors.sittings}</CFormText>}
            </CCol> */}
          </CRow>

          {/* Consultation Fee + Min Time + Image + Description */}
          <CRow>
            {/* <CCol md={3} className="mb-4">
              <h6>
                Package Image <span className="text-danger">*</span>
              </h6>
              <CFormInput type="file" accept="image/*" name="serviceImage" onChange={onChange} />
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
            </CCol> */}

            <CCol md={6} className="mb-4">
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
          </CRow>

          {/* <CCol md={3} className="mb-4">
            <h6>
              Procedure Name <span className="text-danger">*</span>
            </h6>
            <CFormSelect
              name="subServiceId"
              disabled={isEdit}
              value={newService.subServiceId || ''}
              onChange={onSubServiceChange}
            >
              <option value="">Select Procedure</option>
              {isProcedure?.map((procedure) => (
                <option key={procedure.procedureId} value={procedure.procedureId}>
                  {procedure.procedureName}
                </option>
              ))}
            </CFormSelect>
            {errors.subServiceName && (
              <CFormText className="text-danger">{errors.subServiceName}</CFormText>
            )}
          </CCol> */}

          {/* Multiple Procedures + Sitting Section */}
          <h6>Procedures in Package</h6>

          {/* SHOW rows only when user added something */}
          {newService.packageProcedures.length > 0 &&
            newService.packageProcedures.map((item, index) => (
              <CRow key={index} className="mb-3 align-items-center procedure-row">
                <CCol md={6} xs={7} className="procedure-col">
                  <SearchableSelect
                    value={item.procedureId}
                    onChange={(val) =>
                      onChange({
                        target: {
                          name: 'updateProcedure',
                          value: { index, procedureId: val },
                          type: 'custom',
                        },
                      })
                    }
                    options={isProcedure.map((p) => ({
                      label: p.procedureName,
                      value: p.procedureId,
                    }))}
                    disabledOptions={newService.packageProcedures
                      .map((p, i) => (i === index ? null : p.procedureId))
                      .filter(Boolean)}
                  />

                  {errors[`procedureId_${index}`] && (
                    <p className="text-danger">{errors[`procedureId_${index}`]}</p>
                  )}
                </CCol>

                <CCol md={4} xs={3} className="sitting-col">
                  <CFormInput
                    type="number"
                    placeholder="Sit"
                    value={item.sittings}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: 'updateSitting',
                          value: { index, sittings: e.target.value },
                          type: 'custom',
                        },
                      })
                    }
                  />
                  {errors[`sittings_${index}`] && (
                    <p className="text-danger">{errors[`sittings_${index}`]}</p>
                  )}
                </CCol>
                <CCol md={2} xs={2} className="delete-col text-center">
                  <CButton
                    color="danger"
                    size="sm"
                    style={{ color: 'white' }}
                    onClick={() =>
                      onChange({
                        target: { name: 'removeProcedure', value: index, type: 'custom' },
                      })
                    }
                  >
                    X
                  </CButton>
                </CCol>
              </CRow>
            ))}

          <CButton
            style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
            onClick={() =>
              onChange({
                target: { name: 'addProcedure', type: 'custom' },
              })
            }
          >
            + Add Procedure
          </CButton>
          {errors.packageProcedures && (
            <p style={{ marginTop: '5px' }} className="text-danger">
              {errors.packageProcedures}
            </p>
          )}
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

export default PackageFormModal
