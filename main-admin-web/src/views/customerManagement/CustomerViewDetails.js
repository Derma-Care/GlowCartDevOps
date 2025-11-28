import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CRow,
  CCol,
  CSpinner,
  CButton,
} from '@coreui/react'
import { useParams } from 'react-router-dom'
import { getCustomerByMobile } from './CustomerAPI'
import { useNavigate } from 'react-router-dom'

const CustomerViewDetails = () => {
  const navigate = useNavigate()
  const { mobileNumber } = useParams()
  const [activeTab, setActiveTab] = useState(0)
  const [customerData, setCustomerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!mobileNumber) return

    const fetchCustomer = async () => {
      try {
        setLoading(true)
        const response = await getCustomerByMobile(mobileNumber)
        const data = response?.data || response

        setCustomerData({
          ...data,
          email: data.email || data.emailId,
          appointments: data.appointments || [],
        })
      } catch (err) {
        setError('Failed to load customer details.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [mobileNumber])



  // 🌀 Centered Loading State
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh',
          textAlign: 'center',
        }}
      >
        <CSpinner color="primary" />
        <p style={{ marginTop: '10px', fontWeight: 500 }}>
          Loading customer details...
        </p>
      </div>
    )
  }

  // ❌ Centered Error State
  if (error || !customerData) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        <p
          className="text-danger"
          style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#d32f2f',
            padding: '12px 24px',
            borderRadius: '10px',
          }}
        >
          {error || 'Customer not found.'}
        </p>
      </div>
    )
  }

  return (
    <CCard>
      <div className="bg-info text-white p-3 d-flex justify-content-between align-items-center rounded">
        {/* Left section: Booking ID and Status */}
        <div>
          <h5 className="mb-1 text" style={{ color: "white" }}>Customer Details: {customerData.fullName}</h5>
        </div>

        <div className="d-flex gap-2">
          <CButton
            size="sm"
            style={{
              background: '#fff',
              color: '#00838F',
              border: 'none',
              fontWeight: '600',
              borderRadius: '8px',
              padding: '6px 14px',
            }}
            onClick={() => navigate(-1)}
          >
            Back
          </CButton>
        </div>
      </div>

      <CCardBody>
        <CTabs activeTab={activeTab} onActiveTabChange={setActiveTab}>
          <CNav variant="tabs">
            <CNavItem>
              <CNavLink active={activeTab === 0}>Basic Details</CNavLink>
            </CNavItem>
           
          </CNav>
          <CTabContent>
            <CTabPane visible={activeTab === 0}>
              <CCard className="p-3 shadow-sm rounded-3 border-light">
                <CRow className="gy-3">
                  <CCol sm="6">
                    <strong>Customer Id:</strong>
                    <div>{customerData.customerId || '-'}</div>
                  </CCol>
                  <CCol sm="6">
                    <strong>Full Name:</strong>
                    <div>{customerData.fullName || '-'}</div>
                  </CCol>
                  <CCol sm="6">
                    <strong>Email:</strong>
                    <div>{customerData.email || '-'}</div>
                  </CCol>
                  <CCol sm="6">
                    <strong>Mobile Number:</strong>
                    <div>{customerData.mobileNumber || '-'}</div>
                  </CCol>
                  <CCol sm="6">
                    <strong>Gender:</strong>
                    <div>{customerData.gender || '-'}</div>
                  </CCol>
                  <CCol sm="6">
                    <strong>Date of Birth:</strong>
                    <div>{customerData.dateOfBirth || '-'}</div>
                  </CCol>
                  <CCol sm="6">
                    <strong>Refer Code:</strong>
                    <div>{customerData.referCode || '-'}</div>
                  </CCol>
                 
                </CRow>
              </CCard>
            </CTabPane>
       
          </CTabContent>
        </CTabs>
      </CCardBody>
    </CCard>
  )
}

export default CustomerViewDetails
