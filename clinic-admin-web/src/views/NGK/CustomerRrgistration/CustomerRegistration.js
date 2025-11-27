import React, { useEffect, useState } from 'react'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CButton,
  CRow,
  CCol,
  CAlert,
  CFormSelect,
} from '@coreui/react'
import DermaCareLogo from '../../../assets/images/logoN.png'
import '../CustomerRrgistration/Register.css'
import SpinWheel from './SpinWheel'
import SpinResultCard from './SpinResultCard'
import PrizePostDetails from './PrizePostDetails'

import Select from 'react-select'
import { showCustomToast } from '../../../Utils/Toaster'

import { registerCustomer } from '../APIs/registerCustomerApi'
import { verifyRegistrationCode } from '../APIs/verifyRegistrationCode'

import { processFile } from '../Utills/fileUtils'
import { UploadedPreview } from '../Utills/FileUpload'
import { getAllProcedures } from '../APIs/procedureService'
import { getCustomerByCode } from '../APIs/customerApiUsingRC'
export default function NGlowKartPatientRegistration_CoreUI() {
  //   const today = new Date()
  const today = new Date()
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())

  const eighteenYearsAgoISO = eighteenYearsAgo.toISOString().split('T')[0]

  // subtract 12 months
  const past1Year = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())

  const minDate12Months = past1Year.toISOString().split('T')[0]
  const maxToday = today.toISOString().split('T')[0]
  const [aadharVerified, setAadharVerified] = useState(false)
  const [winnerPrize, setWinnerPrize] = useState(null)
  const [spinWhell, setSpinWhell] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [procedureOptions, setProcedureOptions] = useState([])
  const [userData, setUserData] = useState([])
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showWheel, setShowWheel] = useState(false)
  const [instagram, setInstagram] = useState(false)
  const [isRegistration, setIsRegistration] = useState(true)
  useEffect(() => {
    async function fetchProcedures() {
      const list = await getAllProcedures()

      const formatted = list.map((item) => ({
        value: item.procedureId,
        label: item.procedureName,
      }))

      setProcedureOptions(formatted)
    }

    fetchProcedures()
  }, [])

  useEffect(() => {
    // smooth scroll window (fallback)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // smooth scroll the scrollable container
    const panel = document.querySelector('.form-panel')
    if (panel) {
      panel.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    city: '',
    dob: '',
    confirmedVisit: false,
    clinicName: '',
    clinicCityArea: '',
    dateOfLastVisit: '',
    serviceType: '',
    Blood: '',
    registraionCode: '',
    referBy: '',
    Aadhar: '',
    prescription: '',
    referBy: "Neha's GlowKart",

    spinRewardId: '',
    spinRewardValue: '',
    spinRewardImage: '',

    prizePostScreenshot: '',
    followScreenshot: '',
    address: '',
  })

  function applyBackendStatus(status) {
    const {
      registrationCompleted,
      registrationCodeVerified,
      spinWheelCompleted,
      userProfileCompleted,
    } = status

    // 1️⃣ Registration already done → stop
    if (registrationCompleted) {
      showCustomToast('❌ Registration already completed!', 'error')
      return
    }

    // 2️⃣ If user profile NOT completed → show registration form
    if (!userProfileCompleted) {
      setIsRegistration(false) // hide referral code page
      setSubmitted(false)
      setShowWheel(false)
      setInstagram(false)
      return
    }

    // 3️⃣ User completed profile but not spin → show wheel
    if (!spinWheelCompleted) {
      setIsRegistration(false)
      setSubmitted(true)
      setShowWheel(true) // show wheel
      setInstagram(false)
      return
    }

    // 4️⃣ Spin is done → show prize result
    if (spinWheelCompleted) {
      setSubmitted(true)
      setShowWheel(false)
      setInstagram(false)
      return
    }
  }

  function calculateAge(dobStr) {
    if (!dobStr) return 0
    const today = new Date()
    const dob = new Date(dobStr)

    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--

    return age
  }

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleProcedureChange = (selected) => {
    setForm((prev) => ({
      ...prev,
      serviceType: selected.map((item) => item.label), // ✔ store labels
    }))
  }

  const showOtherInput = form.serviceType?.includes('other')
  function handleChange(e) {
    const { name, value, type, checked } = e.target

    setForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value }

      if (name === 'confirmedVisit' && !checked) {
        next.clinicName = ''
        next.clinicCityArea = ''
        next.dateOfLastVisit = ''
        next.serviceType = ''
        next.registraionCode = ''
        next.referBy = ''
      }

      return next
    })

    setErrors((prev) => {
      const n = { ...prev }
      delete n[name]
      return n
    })
  }

  // Handle input change
  const handleRefChange = (e) => {
    const value = e.target.value.toUpperCase()
    setError('')
    setForm((prev) => ({ ...prev, registraionCode: value }))
  }

  const handleSubmitReferralCode = async () => {
    const code = form.registraionCode.trim()
    sessionStorage.setItem('registraionCode', code)
    if (!code) {
      setError('⚠️ Please enter your registration code.')
      return
    }

    try {
      setVerifyLoading(true)
      setError('')

      // 1️⃣ Verify Registration Code
      const result = await verifyRegistrationCode(code)

      if (!result.success) {
        setError(result.message || '❌ Invalid registration code.')
        return
      }

      // 2️⃣ Apply backend-driven screen navigation
      applyBackendStatus(result.data)

      // 3️⃣ Fetch full customer details
      const customerRes = await getCustomerByCode(code)

      if (customerRes.success) {
        const customer = customerRes.data

        // Save in localStorage
        // localStorage.setItem('ngk_customer', JSON.stringify(customer))

        // Update UI state
        setUserData(customer)
      }

      // 4️⃣ Show success toast
      showCustomToast('🎉 Registration code verified!', 'success')
    } catch (err) {
      console.error('Verify Code Error:', err)
      setError('⚠️ Something went wrong. Try again.')
    } finally {
      setVerifyLoading(false)
    }
  }

  function validate() {
    const e = {}

    if (!form.fullName) e.fullName = 'Full name is required'
    if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number'
    if (!form.city) e.city = 'City is required'

    if (!/^\d{12}$/.test(form.Aadhar)) e.Aadhar = 'Enter a valid 12-digit Aadhaar number'

    if (!form.dob) e.dob = 'Date of birth required'
    else if (calculateAge(form.dob) < 18) e.dob = 'Must be at least 18 years old'

    if (form.confirmedVisit) {
      if (!form.clinicName) e.clinicName = 'Clinic name required'
      if (!form.clinicCityArea) e.clinicCityArea = 'Clinic area required'

      if (!form.dateOfLastVisit) e.dateOfLastVisit = 'Last visit date required'
      else {
        const selected = new Date(form.dateOfLastVisit)
        const max = new Date(maxToday)
        const min = new Date(minDate12Months)

        if (selected > max) {
          e.dateOfLastVisit = 'Future dates not allowed'
        } else if (selected < min) {
          e.dateOfLastVisit = 'Visit must be within last 12 months'
        }
      }

      if (!form.serviceType) e.serviceType = 'Service required'
      if (!form.prescription)
        e.prescription = 'Please upload your prescription or bill (PDF, JPG, JPEG, or PNG).'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validate()) return

    const payload = {
      fullName: form.fullName,
      mobile: form.mobile,
      email: form.email,
      city: form.city,
      dob: form.dob,
      clinicName: form.clinicName,
      clinicCityArea: form.clinicCityArea,
      dateOfLastVisit: form.dateOfLastVisit,
      serviceType: form.serviceType,
      blood: form.Blood,
      registrationCode: form.registraionCode || sessionStorage.getItem('registraionCode'),
      referBy: form.referBy,
      aadharNumber: form.Aadhar,
      prescription: form.prescription, // File or text
      referBy: form.referBy,
    }

    try {
      setLoading(true)

      const result = await registerCustomer(payload)

      if (!result.success) {
        showCustomToast(`${result.message}` || '❌ Registration failed!', 'error')
        return
      }

      showCustomToast(`${result.message}` || `🎉 Data Submitted successful!`, 'success')
      setSubmitted(true)
      const data = result.data
      console.log('Customer Registered ID:', data)
      setUserData(data)
      setShowWheel(true)
    } catch (error) {
      console.error('Registration Error:', error)
      showCustomToast('⚠️ Something went wrong! Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const sessionData = sessionStorage.getItem('ngk_session')

    if (sessionData) {
      const state = JSON.parse(sessionData)

      setIsRegistration(state.isRegistration)
      setSubmitted(state.submitted)
      setShowWheel(state.showWheel)
      setInstagram(state.instagram)
      setUserData(state.userData || null)
      setWinnerPrize(state.winnerPrize || null)
      setSpinWhell(state.spinWhell || false)
    }
  }, [])

  useEffect(() => {
    const stateToSave = {
      isRegistration,
      submitted,
      showWheel,
      instagram,
      userData,
      winnerPrize,
      spinWhell,
    }

    sessionStorage.setItem('ngk_session', JSON.stringify(stateToSave))
  }, [isRegistration, submitted, showWheel, instagram, userData, winnerPrize, spinWhell])

  // useEffect(() => {
  //   localStorage.setItem('step_isRegistration', isRegistration)
  // }, [isRegistration])

  // useEffect(() => {
  //   localStorage.setItem('step_submitted', submitted)
  // }, [submitted])

  // useEffect(() => {
  //   localStorage.setItem('step_showWheel', showWheel)
  // }, [showWheel])

  // useEffect(() => {
  //   localStorage.setItem('step_instagram', instagram)
  // }, [instagram])

  return (
    <div
      className="d-flex justify-content-center align-items-center w-100"
      style={{
        height: '100vh',

        overflow: 'hidden',
      }}
    >
      <div className="d-flex w-100 bgCard">
        {/* LEFT IMAGE */}
        <div
          className="d-none d-md-block left-image"
          style={{
            width: '45%',
            backgroundImage:
              "url('https://cdn.vectorstock.com/i/500p/14/58/lip-contouring-procedure-at-beautician-flat-vector-42551458.jpg')",
            backgroundSize: 'fill',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        ></div>

        {/* RIGHT PANEL SCROLL */}
        <div
          className="thin-scroll "
          style={{
            width: '55%',
            height: '100%',
            overflowY: 'auto',
            padding: '40px 30px',
          }}
        >
          {/* HEADER */}
          <div className="header-container">
            <div className="d-flex align-items-start gap-3 mb-2">
              <img
                src={DermaCareLogo}
                alt="logo"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  objectFit: 'cover',
                  border: '1px solid #eee',
                }}
              />
              <div>
                <h4 className="m-0 fw-bold" style={{ color: '#ff4f9a' }}>
                  Neha's Glow Kart
                </h4>
                <small style={{ color: '#ff7bbf' }}>Registration</small>
              </div>
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          <div>
            {submitted ? (
              <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{
                  minHeight: '60vh', // Ensures good centering even on small screens
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                {/* Spin Wheel appears BELOW the message */}
                {showWheel ? (
                  <>
                    {!spinWhell ? (
                      <div>
                        <h3 className="fw-bold">🎉 Verification Pending</h3>
                        <p className="mt-2" style={{ maxWidth: 380 }}>
                          Thanks for joining N Glow Kart! We’re reviewing your information. Your
                          referral credit will be activated within **48 hours** once verified.
                        </p>

                        <div className="text-center mt-4">
                          {/* Pink Button */}
                          <CButton
                            className="btn"
                            style={{
                              background: '#ff2e85',
                              border: 'none',
                              padding: '14px 25px',
                              borderRadius: '10px',
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#fff',
                              boxShadow: '0 4px 12px rgba(255,46,133,0.4)',
                              width: '220px',
                            }}
                            onClick={() => setSpinWhell(true)}
                          >
                            🎡 Spin The Wheel
                          </CButton>

                          {/* Bottom Text */}
                          <p
                            style={{
                              marginTop: '10px',
                              color: '#ff2e85',
                              fontSize: '14px',
                              fontWeight: '500',
                            }}
                          >
                            Spin the wheel and get a gift 🎁
                            <br />
                            Complete your registration to claim it!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-100">
                        <SpinWheel
                          userData={userData}
                          setUserData={setUserData}
                          onResult={(winner) => {
                            console.log('WON:', winner)

                            setForm((prev) => ({
                              ...prev,
                              spinRewardId: winner.id,
                              spinRewardValue: winner.option,
                              spinRewardImage: winner.src,
                            }))

                            // localStorage.setItem('saved_winnerPrize', JSON.stringify(winner))

                            setWinnerPrize(winner)
                            setShowWheel(false) // HIDE WHEEL
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-100 mt-3">
                    {instagram ? (
                      <PrizePostDetails
                        userData={userData}
                        form={form}
                        setForm={setForm}
                        onSubmit={(data) => {
                          console.log('Address from user:', form)
                          // send data to backend or continue next step
                        }}
                      />
                    ) : (
                      <SpinResultCard
                        userData={userData}
                        prize={winnerPrize}
                        form={form}
                        onReset={() => {
                          setShowWheel(true)
                          setWinnerPrize(null)
                        }}
                        setInstagram={setInstagram}
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <CForm onSubmit={handleSubmit}>
                {isRegistration ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      minHeight: '70vh',
                      padding: '20px 0',
                    }}
                  >
                    <div
                      style={{
                        width: 360,
                        textAlign: 'left',
                        background: '#ffffff',
                        padding: '28px 26px',
                        borderRadius: 18,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        border: '1px solid #f4e7f9',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 20,

                          fontWeight: 700,
                          color: '#d81b60',
                          textAlign: 'center',
                        }}
                      >
                        Enter Your Registration Code
                      </h3>

                      {/* <CFormInput
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Enter Full Name"
                      /> */}

                      <CFormInput
                        name="registraionCode"
                        value={form.registraionCode}
                        onChange={handleRefChange}
                        placeholder="Enter Registration Code"
                        style={{
                          borderRadius: 12,
                          height: 45,
                          marginTop: '15px',
                          textTransform: 'uppercase',
                          transition: '0.25s',
                          fontWeight: '500',
                        }}
                      />

                      {/* Error message */}
                      {error && (
                        <p
                          style={{
                            color: '#ff2e85',
                            fontSize: 13,
                            fontWeight: 600,
                            marginTop: 6,
                            marginBottom: 0,
                            textAlign: 'center',
                          }}
                        >
                          {error}
                        </p>
                      )}

                      <CButton
                        type="button"
                        color="primary"
                        style={{
                          marginTop: 18,
                          width: '100%',
                          borderRadius: 12,
                          fontWeight: '600',
                          fontSize: 16,
                          padding: '12px 0',
                          background: isRegistration
                            ? 'linear-gradient(90deg, #e33de9ff, #b26ad8)'
                            : '#c8c6d9',
                          border: 'none',
                          cursor: isRegistration ? 'pointer' : 'not-allowed',
                          boxShadow: isRegistration ? '0 4px 12px rgba(106,90,224,0.35)' : 'none',
                          transition: '0.25s',
                        }}
                        onClick={handleSubmitReferralCode}
                        disabled={!isRegistration || verifyLoading}
                      >
                        {verifyLoading ? 'Verifying...' : 'Submit Registration Code'}
                      </CButton>

                      <p
                        style={{
                          marginTop: 10,
                          fontSize: 13,
                          textAlign: 'center',
                          color: '#999',
                        }}
                      >
                        You'll unlock an exclusive gift after submitting 💝
                      </p>
                    </div>
                  </div>
                ) : (
                  <CRow className="g-4 mt-2">
                    {/* Full Name + Mobile */}
                    <CCol md={6}>
                      <CFormLabel>
                        Full Name (as Per Aadhar Crad) <span className="text-danger">*</span>
                      </CFormLabel>
                      <CFormInput
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Enter Full Name"
                      />
                      {errors.fullName && (
                        <p
                          style={{
                            color: '#ff2e85',
                          }}
                        >
                          {errors.fullName}
                        </p>
                      )}
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>
                        Mobile <span className="text-danger">*</span>
                      </CFormLabel>
                      <CFormInput
                        name="mobile"
                        placeholder="Enter Mobile Number"
                        maxLength={10}
                        inputMode="numeric"
                        value={form.mobile}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          handleChange({ target: { name: 'mobile', value } })
                        }}
                      />
                      {errors.mobile && (
                        <p
                          style={{
                            color: '#ff2e85',
                          }}
                        >
                          {errors.mobile}
                        </p>
                      )}
                    </CCol>

                    {/* DOB + City */}
                    <CCol md={6}>
                      <CFormLabel>
                        DOB <span className="text-danger">*</span>
                      </CFormLabel>

                      <CFormInput
                        type="date"
                        name="dob"
                        max={eighteenYearsAgoISO} // 🚀 Max date = 18 years old
                        value={form.dob}
                        onFocus={(e) => {
                          const input = e.target
                          input.value = eighteenYearsAgoISO // 🚀 Calendar opens showing 18yr old
                          input.showPicker?.()
                          setTimeout(() => {
                            if (!form.dob) input.value = ''
                          }, 0)
                        }}
                        onChange={handleChange}
                      />

                      {errors.dob && <p style={{ color: '#ff2e85' }}>{errors.dob}</p>}
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>
                        City <span className="text-danger">*</span>
                      </CFormLabel>
                      <CFormInput
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Enter City"
                      />
                      {errors.city && (
                        <p
                          style={{
                            color: '#ff2e85',
                          }}
                        >
                          {errors.city}
                        </p>
                      )}
                    </CCol>

                    {/* Email + Blood */}
                    <CCol md={6}>
                      <CFormLabel>Email (Optional)</CFormLabel>
                      <CFormInput
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter Email"
                      />
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>Blood Group (Optional)</CFormLabel>
                      <CFormSelect name="Blood" value={form.Blood} onChange={handleChange}>
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={12}>
                      <CFormLabel>
                        Aadhaar Card Number <span className="text-danger">*</span>
                      </CFormLabel>

                      <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                        <CFormInput
                          name="Aadhar"
                          inputMode="numeric"
                          maxLength={12}
                          value={form.Aadhar}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '') // Only digits
                            handleChange({ target: { name: 'Aadhar', value } })

                            // If user typed all 12 digits
                            if (value.length === 12) {
                              setErrors((prev) => ({ ...prev, Aadhar: null }))
                              setAadharVerified(true)
                            } else {
                              setAadharVerified(false)

                              // Show error only when user enters something but not 12 digits
                              if (value.length > 0 && value.length < 12) {
                                setErrors((prev) => ({
                                  ...prev,
                                  Aadhar: 'Aadhaar must be exactly 12 digits',
                                }))
                              } else {
                                setErrors((prev) => ({ ...prev, Aadhar: null }))
                              }
                            }
                          }}
                          placeholder="Enter 12-digit Aadhaar number"
                        />
                      </div>

                      {/* Error */}
                      {errors.Aadhar && (
                        <p
                          style={{
                            color: '#ff2e85',
                          }}
                        >
                          {errors.Aadhar}
                        </p>
                      )}
                    </CCol>

                    {/* Consent */}
                    <CCol md={12}>
                      <CFormCheck
                        className="custom-checkbox"
                        name="confirmedVisit"
                        checked={form.confirmedVisit}
                        onChange={handleChange}
                        label="I confirm that I have availed dermatology or cosmetic services from a verified clinic within the last 12 months and agree to N Glow Kart’s verification and data "
                      />
                      <a
                        href="/pdf/privacy-policy.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#ff2e85',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          marginLeft: '25px',
                        }}
                      >
                        Privacy Policy
                      </a>
                      {/* <a
                        href="/pdf/privacy-policy.pdf"
                        download="Nehas_GlowKart_Privacy_Policy.pdf"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          backgroundColor: '#ff2e85',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '10px',
                          fontWeight: '600',
                          width: 'fit-content',
                        }}
                      >
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/724/724933.png"
                          style={{ width: 20, height: 20 }}
                        />
                        Download Privacy Policy
                      </a> */}
                    </CCol>

                    {/* Conditional fields */}
                    {form.confirmedVisit && (
                      <>
                        <CCol md={6}>
                          <CFormLabel>
                            Clinic Name <span className="text-danger">*</span>
                          </CFormLabel>
                          <CFormInput
                            name="clinicName"
                            placeholder="Enter Clinic Name"
                            value={form.clinicName}
                            onChange={handleChange}
                          />
                          {errors.clinicName && (
                            <p
                              style={{
                                color: '#ff2e85',
                              }}
                            >
                              {errors.clinicName}
                            </p>
                          )}
                        </CCol>

                        <CCol md={6}>
                          <CFormLabel>
                            Clinic Area <span className="text-danger">*</span>
                          </CFormLabel>
                          <CFormInput
                            name="clinicCityArea"
                            placeholder="Enter Clinic City/Area"
                            value={form.clinicCityArea}
                            onChange={handleChange}
                          />
                          {errors.clinicCityArea && (
                            <p
                              style={{
                                color: '#ff2e85',
                              }}
                            >
                              {errors.clinicCityArea}
                            </p>
                          )}
                        </CCol>

                        <CCol md={6}>
                          <CFormLabel>
                            Last Visit <span className="text-danger">*</span>
                          </CFormLabel>

                          <CFormInput
                            type="date"
                            name="dateOfLastVisit"
                            max={maxToday} // today
                            min={minDate12Months} // today - 1 year
                            value={form.dateOfLastVisit}
                            onFocus={(e) => {
                              const input = e.target
                              input.value = maxToday // show today's date on picker open
                              input.showPicker?.()
                              setTimeout(() => {
                                if (!form.dateOfLastVisit) input.value = ''
                              }, 0)
                            }}
                            onChange={handleChange}
                          />

                          {errors.dateOfLastVisit && (
                            <p style={{ color: '#ff2e85' }}>{errors.dateOfLastVisit}</p>
                          )}
                        </CCol>

                        <CCol md={6}>
                          <CFormLabel>
                            Service Availed <span className="text-danger">*</span>
                          </CFormLabel>
                          <Select
                            options={procedureOptions}
                            isMulti
                            placeholder="Select services received..."
                            onChange={handleProcedureChange}
                            styles={selectStyles}
                            value={procedureOptions.filter(
                              (opt) => form.serviceType?.includes(opt.label), // ✔ match using label
                            )}
                          />

                          {errors.serviceType && (
                            <p
                              style={{
                                color: '#ff2e85',
                              }}
                            >
                              {errors.serviceType}
                            </p>
                          )}
                          {/* Other input */}
                          {showOtherInput && (
                            <div style={{ marginTop: 10 }}>
                              <CFormLabel>Specify Other Service</CFormLabel>
                              <CFormInput
                                placeholder="Enter Service Name"
                                value={form.otherServiceName || ''}
                                onChange={(e) =>
                                  setForm((prev) => ({ ...prev, otherServiceName: e.target.value }))
                                }
                              />
                            </div>
                          )}
                        </CCol>
                        <div>
                          <CFormLabel>
                            Upload your last visit bill or prescription{' '}
                            <span className="text-danger">*</span>
                          </CFormLabel>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '10px',
                              alignContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <label
                              style={{
                                border: '2px dashed #ff95c9',
                                borderRadius: 12,
                                padding: '18px',
                                width: '100%',
                                textAlign: 'center',
                                display: 'block',
                                cursor: 'pointer',
                                background: '#fff8fc',
                                color: '#ff2e85',
                                fontWeight: '500',
                                fontSize: 15,
                              }}
                            >
                              📁 Tap to upload Prescription / Bill
                              <input
                                type="file"
                                accept="image/*, application/pdf"
                                onChange={async (e) => {
                                  const file = e.target.files[0]
                                  if (!file) return

                                  try {
                                    const base64 = await processFile(file)
                                    updateForm('prescription', base64)
                                  } catch (err) {
                                    alert(err.message)
                                    e.target.value = ''
                                  }
                                }}
                                style={{ display: 'none' }}
                              />
                            </label>
                            <UploadedPreview src={form.prescription} />
                          </div>
                        </div>
                        <small style={{ color: '#888', display: 'block' }}>
                          Accepted formats: PDF, JPG, JPEG, PNG
                        </small>

                        {errors.prescription && (
                          <div
                            style={{
                              color: '#ff2e85',
                            }}
                          >
                            {errors.prescription}
                          </div>
                        )}
                      </>
                    )}

                    {/* Submit */}
                    <CCol md={12} className="mt-3 d-flex justify-content-end">
                      <CButton
                        style={{ background: '#ff4f9a', color: '#fff' }}
                        disabled={!form.confirmedVisit || loading}
                        type="submit"
                      >
                        {loading ? 'Submitting...' : 'Submit'}
                      </CButton>
                    </CCol>
                  </CRow>
                )}
              </CForm>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: '#ccc',
    color: '#000',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#000', // selected value color
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#000', // selected chips text
  }),
  option: (base, state) => ({
    ...base,
    color: '#000', // dropdown text
    backgroundColor: state.isSelected ? '#ffe0f1' : '#fff',
    ':hover': {
      backgroundColor: '#ffeaf6',
      color: '#000',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#777', // placeholder grey
  }),
}
