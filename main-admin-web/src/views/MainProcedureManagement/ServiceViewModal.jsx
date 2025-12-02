// ServiceViewModal.jsx
import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CButton,
} from '@coreui/react'

const ServiceViewModal = ({ visible, data, onClose, formatMinutes }) => {
  if (!data) return null

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      backdrop="static"
      className="custom-modal"
    >
      <CModalHeader className="text-white">
        <CModalTitle className="w-100 text-center fs-5 fw-bold">Procedure Details</CModalTitle>
      </CModalHeader>

      <CModalBody className="bg-light text-dark">
        {/* Basic Details */}
        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Basic Information</h6>
          <CRow className="gy-2">
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Procedure Name:</p>
              <span className="text-muted">{data.procedureName || 'N/A'}</span>
            </CCol>
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Procedure ID:</p>
              <span className="text-muted">{data.procedureId || 'N/A'}</span>
            </CCol>
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Offer Start Date:</p>
              <span className="text-muted">
                {data.offerStart ? new Date(data.offerStart).toLocaleDateString('en-GB') : 'N/A'}
              </span>
            </CCol>
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Offer End Date:</p>
              <span className="text-muted">
                {data.offerValidDate
                  ? new Date(data.offerValidDate).toLocaleDateString('en-GB')
                  : 'N/A'}
              </span>
            </CCol>
          </CRow>
        </div>

        {/* Pricing Details */}
        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Pricing Details</h6>
          <CRow className="gy-2">
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Offer End Date:</span>
              <span className="text-muted"> ₹ {Math.round(data.price || 0)}</span>
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Discount:</span>
              <span className="text-muted"> {Math.round(data.discountPercentage || 0)}%</span>
              {/* <strong>Discount:</strong> {Math.round(data.discountPercentage || 0)}% */}
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Discount Amount:</span>
              <span className="text-muted"> ₹ {Math.round(data.discountAmount || 0)}</span>
              {/* <strong>Discount Amount:</strong> ₹ {Math.round(data.discountAmount || 0)} */}
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Discounted Cost:</span>
              <span className="text-muted"> ₹ {Math.round(data.discountedCost || 0)}</span>
              {/* <strong>Discounted Cost:</strong> ₹ {Math.round(data.discountedCost || 0)} */}
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Tax:</span>
              <span className="text-muted"> {Math.round(data.taxPercentage || 0)}%</span>
              {/* <strong>Tax:</strong> {Math.round(data.taxPercentage || 0)}% */}
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Tax Amount:</span>
              <span className="text-muted"> ₹ {Math.round(data.taxAmount || 0)}</span>
              {/* <strong>Tax Amount:</strong> ₹ {Math.round(data.taxAmount || 0)} */}
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Clinic Pay:</span>
              <span className="text-muted"> ₹ {Math.round(data.clinicPay || 0)}</span>
              {/* <strong>Clinic Pay:</strong> ₹ {Math.round(data.clinicPay || 0)} */}
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">GST %:</span>
              <span className="text-muted"> {Math.round(data.gst || 0)}</span>
              {/* <strong>GST %:</strong> {Math.round(data.gst || 0)} */}
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Consultation Fee:</span>
              <span className="text-muted"> ₹ {data.consultationFee || 0}</span>
              {/* <strong>Consultation Fee:</strong> ₹ {data.consultationFee || 0} */}
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Final Cost:</span>
              <span className="text-muted"> ₹ {Math.round(data.finalCost || 0)}</span>
              {/* <strong>Final Cost:</strong> ₹ {Math.round(data.finalCost || 0)} */}
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Service Time:</span>
              <span className="text-muted">
                {data.minTime ? formatMinutes(data.minTime) : 'N/A'}
              </span>
              {/* <strong>Service Time:</strong> {data.minTime ? formatMinutes(data.minTime) : 'N/A'} */}
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">No. of Sittings:</span>
              <span className="text-muted">
                {' '}
                {data.minTime ? formatMinutes(data.sittings) : 'N/A'}
              </span>
              {/* <strong>No. of Sittings:</strong> {data.sittings || 'N/A'} */}
            </CCol>
          </CRow>
        </div>

        {/* Q&A Sections */}
        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Pre-Procedure QA</h6>
          {Array.isArray(data.preProcedureQA) && data.preProcedureQA.length > 0 ? (
            data.preProcedureQA.map((qa, index) => {
              const question = Object.keys(qa)[0]
              const answers = qa[question]
              return (
                <div key={index} className="mb-2">
                  <strong style={{ color: 'var(--color-black)' }} className="fw-semibold">
                    {question}
                  </strong>
                  <ul className="mb-1 text-muted ps-3">
                    {answers.map((ans, i) => (
                      <li key={i}>{ans}</li>
                    ))}
                  </ul>
                </div>
              )
            })
          ) : (
            <p className="text-muted">No Pre-Procedure Q&A available.</p>
          )}
        </div>

        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Procedure QA</h6>
          {Array.isArray(data.procedureQA) && data.procedureQA.length > 0 ? (
            data.procedureQA.map((qa, index) => {
              const question = Object.keys(qa)[0]
              const answers = qa[question]
              return (
                <div key={index} className="mb-2">
                  <strong>{question}</strong>
                  <ul className="mb-1 text-muted ps-3">
                    {answers.map((ans, i) => (
                      <li key={i}>{ans}</li>
                    ))}
                  </ul>
                </div>
              )
            })
          ) : (
            <p className="text-muted">No Procedure Q&A available.</p>
          )}
        </div>

        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Post-Procedure QA</h6>
          {Array.isArray(data.postProcedureQA) && data.postProcedureQA.length > 0 ? (
            data.postProcedureQA.map((qa, index) => {
              const question = Object.keys(qa)[0]
              const answers = qa[question]
              return (
                <div key={index} className="mb-2">
                  <strong>{question}</strong>
                  <ul className="mb-1 text-muted ps-3">
                    {answers.map((ans, i) => (
                      <li key={i}>{ans}</li>
                    ))}
                  </ul>
                </div>
              )
            })
          ) : (
            <p className="text-muted">No Post-Procedure Q&A available.</p>
          )}
        </div>

        {/* Image & Description */}
        <div className="p-3 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Additional Details</h6>
          <CRow>
            <CCol sm={6}>
              <p className="fw-semibold">Service Image:</p>
              {data.procedureImage ? (
                <img
                  src={`data:image/png;base64,${data.procedureImage}`}
                  alt="Service"
                  style={{
                    width: '100%',
                    maxWidth: '250px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                />
              ) : (
                <p className="text-muted">No image available</p>
              )}
            </CCol>
            <CCol sm={6}>
              <p className="fw-semibold">Description:</p>
              <p className="text-muted">{data.description || 'N/A'}</p>
            </CCol>
          </CRow>
        </div>
      </CModalBody>

      <CModalFooter className="bg-light">
        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ServiceViewModal
