import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CRow,
  CCol,
  CSpinner,
  CButton
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCustomerByMobile } from './CustomerAPI'
import { NGK_COLORS } from '../../Constant/Themes'

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
          appointments: data.appointments || []
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

  const renderField = (label, value, isImage = false) => {
    if (!value) return null

    return (
      <CCol sm="6">
        <strong>{label}:</strong>
        <div>
          {isImage ? (
            <img
              src={value}
              alt={label}
              style={{ width: '80px', height: '80px', borderRadius: '8px' }}
            />
          ) : (
            value
          )}
        </div>
      </CCol>
    )
  }

  // -------------------------
  // TAB VISIBILITY CONDITIONS
  // -------------------------

  const tabs = [
    {
      id: 0,
      title: 'Basic',
      visible: customerData && (
        customerData.fullName ||
        customerData.email ||
        customerData.mobile ||
        customerData.gender ||
        customerData.city
      )
    },
    {
      id: 1,
      title: 'Clinic',
      visible: customerData && (
        customerData.clinicName ||
        customerData.clinicCityArea ||
        customerData.dateOfLastVisit ||
        customerData.serviceType
      )
    },
    {
      id: 2,
      title: 'Spin Wheel',
      visible: customerData && (
        customerData.spinRewardId ||
        customerData.spinRewardValue ||
        customerData.spinWheelCompleted
      )
    },
    {
      id: 3,
      title: 'KYC',
      visible: customerData && (
        customerData.aadharNumber ||
        customerData.registrationCode ||
        customerData.registrationCompleted
      )
    },
    {
      id: 4,
      title: 'Images',
      visible: customerData && (
        customerData.photo ||
        customerData.followScreenshot ||
        customerData.prizePostScreenshot ||
        customerData.prescription
      )
    },
    {
      id: 5,
      title: 'Other',
      visible: customerData && (
        customerData.skinTone ||
        customerData.concern ||
        customerData.referBy
      )
    }
  ]

  // FILTER OUT HIDDEN TABS
  const visibleTabs = tabs.filter(t => t.visible)

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
        <CSpinner color="primary" />
        <p className="mt-2 fw-semibold">Loading customer details...</p>
      </div>
    )
  }

  if (error || !customerData) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
        <p className="text-danger fw-bold">{error || 'Customer not found.'}</p>
      </div>
    )
  }

  return (
    <CCard>

      {/* HEADER */}
      <div
         className="text-white p-3 d-flex justify-content-between align-items-center rounded"
        style={{  background: 'linear-gradient(135deg, var(--color-black), var(--color-bgcolor))',color: 'white'}}
      >
        <h5 className="mb-1" style={{ color: 'white' }}>
          Customer Details: {customerData.fullName}
        </h5>

        <CButton
          size="sm"
          style={{
            background: '#fff',
            color: NGK_COLORS.primary,
            border: 'none',
            fontWeight: '600',
            borderRadius: '8px',
            padding: '6px 14px'
          }}
          onClick={() => navigate(-1)}
        >
          Back
        </CButton>
      </div>

      <CCardBody>

        {/* TABS WITH SPACE BELOW */}
        <CNav variant="tabs" className="mb-3">

          {visibleTabs.map(tab => (
            <CNavItem key={tab.id}>
              <CNavLink
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ cursor: 'pointer' }}
              >
                {tab.title}
              </CNavLink>
            </CNavItem>
          ))}

        </CNav>

        {/* TAB CONTENT */}
        <CTabContent>

          {/* BASIC */}
          <CTabPane visible={activeTab === 0}>
            <CCard className="p-3 shadow-sm">
              <CRow className="gy-3">
                {renderField('Customer ID', customerData.customerId)}
                {renderField('Full Name', customerData.fullName)}
                {renderField('Email', customerData.email)}
                {renderField('Mobile Number', customerData.mobile)}
                {renderField('Gender', customerData.gender)}
                {renderField('DOB', customerData.dob)}
                {renderField('City', customerData.city)}
                {renderField('Address', customerData.address)}
              </CRow>
            </CCard>
          </CTabPane>

          {/* CLINIC */}
          <CTabPane visible={activeTab === 1}>
            <CCard className="p-3 shadow-sm">
              <CRow className="gy-3">
                {renderField('Clinic Name', customerData.clinicName)}
                {renderField('Clinic Area', customerData.clinicCityArea)}
                {renderField('Last Visit', customerData.dateOfLastVisit)}
                {renderField(
                  'Service Type',
                  Array.isArray(customerData.serviceType)
                    ? customerData.serviceType.join(', ')
                    : customerData.serviceType
                )}
                {renderField('Service Status', customerData.serviceStatus)}
              </CRow>
            </CCard>
          </CTabPane>

          {/* SPIN WHEEL */}
          <CTabPane visible={activeTab === 2}>
            <CCard className="p-3 shadow-sm">
              <CRow className="gy-3">
                {renderField('Spin Reward Id', customerData.spinRewardId)}
                {renderField('Spin Reward Value', customerData.spinRewardValue)}
                {renderField('Spin Wheel Completed', customerData.spinWheelCompleted ? 'Yes' : 'No')}
                {renderField(
                  'Spin Reward Image',
                  customerData.spinRewardImage ? `data:image/png;base64,${customerData.spinRewardImage}` : null,
                  true
                )}
              </CRow>
            </CCard>
          </CTabPane>

          {/* KYC */}
          <CTabPane visible={activeTab === 3}>
            <CCard className="p-3 shadow-sm">
              <CRow className="gy-3">
                {renderField('Aadhaar Number', customerData.aadharNumber)}
                {renderField(
                  'Aadhaar Consent',
                  customerData.aadhaarConsent === null
                    ? null
                    : customerData.aadhaarConsent
                    ? 'Yes'
                    : 'No'
                )}
                {renderField('Registration Code', customerData.registrationCode)}
                {renderField('Registration Verified', customerData.registrationCodeVerified ? 'Yes' : 'No')}
                {renderField('Registration Completed', customerData.registrationCompleted ? 'Yes' : 'No')}
              </CRow>
            </CCard>
          </CTabPane>

          {/* IMAGES */}
          <CTabPane visible={activeTab === 4}>
            <CCard className="p-3 shadow-sm">
              <CRow className="gy-3">
                {renderField(
                  'Photo',
                  customerData.photo ? `data:image/png;base64,${customerData.photo}` : null,
                  true
                )}
                {renderField('Follow Screenshot', customerData.followScreenshot, true)}
                {renderField('Prize Screenshot', customerData.prizePostScreenshot, true)}
                {renderField('Prescription', customerData.prescription, true)}
              </CRow>
            </CCard>
          </CTabPane>

          {/* OTHER */}
          <CTabPane visible={activeTab === 5}>
            <CCard className="p-3 shadow-sm">
              <CRow className="gy-3">
                {renderField('Skin Tone', customerData.skinTone)}
                {renderField('Concern', customerData.concern)}
                {renderField('Referral By', customerData.referBy)}
                {renderField('User Profile Completed', customerData.userProfileCompleted ? 'Yes' : 'No')}
              </CRow>
            </CCard>
          </CTabPane>

        </CTabContent>
      </CCardBody>
    </CCard>
  )
}

export default CustomerViewDetails
