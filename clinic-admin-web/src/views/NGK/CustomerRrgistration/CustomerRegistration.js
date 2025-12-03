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
import DermaCareLogo from '../../../assets/images/logoP.png'
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
import OnboardingStepsCard from '../Widget/onboarding_steps_card'
import OnboardingStepsModal from '../Widget/OnboardingStepsModal'
import RegistrationCodeCard from '../Widget/RegistrationCodeCard'
import { NGK_COLORS } from '../../../Constant/Themes'
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
  const [showAadhaarModal, setShowAadhaarModal] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [serviceStatusError, setServiceStatusError] = useState('')

  useEffect(() => {
    async function fetchProcedures() {
      const list = await getAllProcedures()

      const formatted = list.map((item) => ({
        value: item.procedureId,
        label: item.procedureName,
      }))
      formatted.push({
        value: 'other',
        label: 'Others',
      })

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

    clinicName: '',
    clinicCityArea: '',
    dateOfLastVisit: '',
    serviceType: [],
    blood: '',
    registraionCode: '',
    referBy: '',
    Aadhar: '',
    prescription: '',
    referBy: "Neha's GlowKart",
    otherServiceName: '',
    gender: '',

    spinRewardId: '',
    spinRewardValue: '',
    spinRewardImage: '',

    prizePostScreenshot: '',
    followScreenshot: '',
    address: '',

    // Interested flow
    serviceStatus: '',
    interestCategory: '',
    problemDescription: [],
    skinTone: '',
    samplePhoto: '',
    aadhaarConsent: false,
    userConsent: false,
    privacyConsent: false,
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
    const labels = selected.map((item) => (item.value === 'other' ? 'other' : item.label))

    setForm((prev) => ({
      ...prev,
      serviceType: labels,
    }))
  }

  const showOtherInput = form.serviceType?.includes('other')
  function handleChange(e) {
    const { name, value, type, checked } = e.target

    setForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value }

      if (name === 'serviceStatus' && !checked) {
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

  console.log(form.otherServiceName)

  function validate() {
    const e = {}

    if (!form.fullName) e.fullName = 'Full name is required'
    if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number'
    if (!form.city) e.city = 'City is required'

    if (!/^\d{12}$/.test(form.Aadhar)) e.Aadhar = 'Enter a valid 12-digit Aadhaar number'

    if (!form.dob) e.dob = 'Date of birth required'
    if (!form.gender) e.gender = 'gender required'
    else if (calculateAge(form.dob) < 18) e.dob = 'Must be at least 18 years old'

    if (form.serviceStatus == '1') {
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
        e.prescription = 'Please upload your receipt (PDF, JPG, JPEG, or PNG).'
    }
    // ✔ INTERESTED FLOW – Validate interest info
    if (form.serviceStatus === '2') {
      if (!form.interestCategory) e.interestCategory = 'Please select an interest category'
      if (!form.problemDescription || form.problemDescription.length === 0)
        e.problemDescription = 'Please select at least one concern'

      if (!form.skinTone) e.skinTone = 'Please select your skin tone'
      // samplePhoto optional
    }

    if (!form.aadhaarConsent)
      e.aadhaarConsent = 'You must accept Aadhaar consent before submitting.'

    if (!form.userConsent) e.userConsent = 'You must agree to the User Consent Disclaimer.'

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
      serviceType: form.serviceType.map((s) => (s === 'other' ? form.otherServiceName : s)),
      blood: form.blood,
      registrationCode: form.registraionCode || sessionStorage.getItem('registraionCode'),
      referBy: form.referBy,
      aadharNumber: form.Aadhar,
      prescription: form.prescription, // File or text
      referBy: form.referBy,
      gender: form.gender,
      serviceStatus: form.serviceStatus,
      concern: form.problemDescription.map((item) =>
        item === 'other' ? form.otherServiceName : item,
      ),
      category: form.interestCategory,
      skinTone: form.skinTone,
      photo: form.samplePhoto,
      aadhaarConsent: form.aadhaarConsent,
    }

    console.log(form)
    console.log(
      form.problemDescription.map((item) => (item === 'other' ? form.otherServiceName : item)),
    )

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
      // setWinnerPrize(state.winnerPrize || null)
      setSpinWhell(state.spinWhell || false)
    }
  }, [])

  const handleServiceStatusSelect = (status) => {
    let missing = []

    if (!form.userConsent) missing.push('User Consent Disclaimer')
    if (!form.privacyConsent) missing.push('Privacy Policy')
    if (!form.aadhaarConsent) missing.push('Aadhaar Consent')

    if (missing.length > 0) {
      setServiceStatusError(`Please agree to: ${missing.join(', ')}.`)
      return
    }

    setServiceStatusError('') // ⭐ Clear when no missing consents
    setForm({ ...form, serviceStatus: status })
  }

  function cleanUserData(data) {
    if (!data) return null

    const { prescription, samplePhoto, prizePostScreenshot, followScreenshot, ...rest } = data

    return rest
  }

  useEffect(() => {
    const stateToSave = {
      isRegistration,
      submitted,
      showWheel,
      instagram,
      userData: cleanUserData(userData),
      // winnerPrize,
      spinWhell,
    }

    sessionStorage.setItem('ngk_session', JSON.stringify(stateToSave))
  }, [isRegistration, submitted, showWheel, instagram, userData, winnerPrize, spinWhell])

  console.log(form.serviceStatus)
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
      className="d-flex justify-content-center align-items-center   w-100"
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
        >
          {' '}
          <img
            src={DermaCareLogo}
            alt="logo"
            style={{
              height: 100,
              borderRadius: 12,
              objectFit: 'fill',
              // border: '1px solid #eee',
            }}
          />
        </div>

        {/* RIGHT PANEL SCROLL */}
        <div
          className="thin-scroll form-panel"
          style={{
            width: '55%',
            height: '100%',
            overflowY: 'auto',
            padding: '40px 30px',
          }}
        >
          {/* HEADER */}
          <div className="header-container">
            {!spinWhell ? (
              <h4 className="m-0 fw-bold text-center w-100 gradient-text">Registration</h4>
            ) : (
              <h4 className="m-0 fw-bold text-center w-100 gradient-text">Spin and Win</h4>
            )}
            {/* <h4 className="m-0 fw-bold text-center w-100 gradient-text">Registration</h4> */}
            {/* <small className="sub-gradient-text">Registration</small> */}
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
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: '80vh', // Vertically centers
                          textAlign: 'center',
                          padding: '20px',
                        }}
                      >
                        <div>
                          <h3 className="fw-bold" style={{ color: NGK_COLORS.primary }}>
                            🎉 Verification Pending
                          </h3>

                          <p
                            className="mt-2"
                            style={{ maxWidth: 380, color: NGK_COLORS.textDark, margin: '0 auto' }}
                          >
                            Thanks for joining N Glow Kart!! Verification is underway. You can spin
                            now, and rewards will be dispatched after successful verification.
                          </p>

                          <div className="text-center mt-4">
                            <CButton
                              className="btn"
                              style={{
                                background: NGK_COLORS.primary,
                                border: 'none',
                                padding: '14px 25px',
                                borderRadius: '10px',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#fff',
                                boxShadow: `0 4px 12px ${NGK_COLORS.primary}`,
                                width: '220px',
                              }}
                              onClick={() => setSpinWhell(true)}
                            >
                              🎡 Spin and Win
                            </CButton>

                            <p
                              style={{
                                marginTop: '10px',
                                color: NGK_COLORS.primary,
                                fontSize: '14px',
                                fontWeight: '500',
                              }}
                            >
                              Complete your registration to claim it!
                            </p>
                          </div>
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
                      alignContent: 'center',
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
                      <CFormInput
                        name="registraionCode"
                        value={form.registraionCode}
                        onChange={handleRefChange}
                        placeholder="Enter Registration Code"
                        style={{
                          borderRadius: 12,
                          height: 45,
                          marginTop: '15px',
                          marginBottom: '25px',
                          // textTransform: 'uppercase',
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
                          width: '60%',
                          borderRadius: 12,
                          fontWeight: '600',
                          fontSize: 16,
                          padding: '12px 0',

                          background: isRegistration
                            ? 'linear-gradient(90deg, #D2025B, #A82E4C)'
                            : '#c8c6d9',
                          border: 'none',
                          cursor: isRegistration ? 'pointer' : 'not-allowed',
                          boxShadow: isRegistration ? '0 4px 12px rgba(106,90,224,0.35)' : 'none',
                          transition: '0.25s',
                          display: 'flex',
                          justifyContent: 'center',
                          margin: '0 auto', // <-- This centers the button
                        }}
                        onClick={handleSubmitReferralCode}
                        disabled={!isRegistration || verifyLoading}
                      >
                        {verifyLoading ? 'Verifying...' : 'Verify'}
                      </CButton>

                      <div className="my-2">
                        <OnboardingStepsModal />
                      </div>

                      <p
                        style={{
                          marginTop: 10,
                          fontSize: 13,
                          textAlign: 'center',
                          color: '#999',
                        }}
                      >
                        Provide valid registration details and get a free spin for a chance to win
                        amazing prizes.
                      </p>
                    </div>

                    {/* <RegistrationCodeCard
                      form={form}
                      error={error}
                      isRegistration={isRegistration}
                      verifyLoading={verifyLoading}
                      handleRefChange={handleRefChange}
                      handleSubmitReferralCode={handleSubmitReferralCode}
                    /> */}
                  </div>
                ) : (
                  <CRow className="g-4 mt-2">
                    {/* Full Name + Mobile */}
                    <CCol md={6}>
                      <CFormLabel className="label-gradient">
                        Full Name (As Per Aadhaar Card) <span className="text-danger">*</span>
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
                      <CFormLabel className="label-gradient">
                        Mobile Number <span className="text-danger">*</span>
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
                      <CFormLabel className="label-gradient">Gender</CFormLabel>
                      <CFormSelect name="gender" value={form.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Others">Others</option>
                      </CFormSelect>

                      {errors.gender && <p style={{ color: '#ff2e85' }}>{errors.gender}</p>}
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel className="label-gradient">
                        Date of birth <span className="text-danger">*</span>
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

                    {/* Email + Blood */}
                    <CCol md={6}>
                      <CFormLabel className="label-gradient">Email (Optional)</CFormLabel>
                      <CFormInput
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter Email"
                      />
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel className="label-gradient">Blood Group (Optional)</CFormLabel>
                      <CFormSelect name="blood" value={form.blood} onChange={handleChange}>
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

                    <CCol md={6}>
                      <CFormLabel className="label-gradient">
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
                    <CCol md={6}>
                      <CFormLabel className="label-gradient">
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
                      {errors.Aadhar && (
                        <p
                          style={{
                            color: '#ff2e85',
                          }}
                        >
                          {errors.Aadhar}
                        </p>
                      )}

                      {/* Error */}
                    </CCol>
                    <CCol md={12} style={{ marginTop: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={form.userConsent}
                          disabled={form.userConsent}
                          onChange={(e) => {
                            setForm({ ...form, userConsent: e.target.checked })

                            if (e.target.checked) {
                              setErrors((prev) => ({ ...prev, userConsent: '' }))
                              setServiceStatusError('')
                            }
                          }}
                          style={{
                            width: '15px',
                            height: '15px',
                            accentColor: NGK_COLORS.primary, // Checkbox color
                            cursor: 'pointer',
                            marginTop: '3px',
                          }}
                        />

                        {/* Text with clickable link */}
                        <div style={{ fontSize: '16px', color: '#555' }}>
                          I agree to the{' '}
                          <span
                            style={{
                              color: NGK_COLORS.primary,
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                            onClick={() => setShowConsentModal(true)}
                          >
                            User Consent Disclaimer
                          </span>
                          .
                        </div>
                      </div>

                      {/* Error */}
                      {errors.userConsent && (
                        <p style={{ color: NGK_COLORS.primary, marginTop: '5px' }}>
                          {errors.userConsent}
                        </p>
                      )}
                    </CCol>

                    <div
                      className="d-flex align-items-start  "
                      style={{ gap: '10px', marginTop: '10px' }}
                    >
                      <input
                        type="checkbox"
                        checked={form.privacyConsent}
                        disabled={form.privacyConsent}
                        onChange={(e) => {
                          setForm({ ...form, privacyConsent: e.target.checked })
                          if (e.target.checked) {
                            setErrors((prev) => ({ ...prev, privacyConsent: '' }))
                            setServiceStatusError('')
                          }
                        }}
                        style={{
                          width: '15px',
                          height: '15px',
                          accentColor: NGK_COLORS.primary, // Checkbox color
                          cursor: 'pointer',
                          marginTop: '3px',
                        }}
                      />

                      <label style={{ fontSize: '16px', color: '#555', cursor: 'pointer' }}>
                        I have read understood{' '}
                        <a
                          href="/pdf/privacy-policy.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: NGK_COLORS.primary,
                            textDecoration: 'underline',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    {/* Error Message */}
                    {errors.privacyConsent && (
                      <p style={{ color: '#ff2e85', fontSize: '13px', marginLeft: '28px' }}>
                        {errors.privacyConsent}
                      </p>
                    )}

                    <CCol md={12}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={form.aadhaarConsent}
                            disabled={form.aadhaarConsent}
                            onChange={(e) => {
                              setForm({ ...form, aadhaarConsent: e.target.checked })

                              // remove error when checked
                              if (e.target.checked) {
                                setErrors((prev) => ({ ...prev, aadhaarConsent: '' }))
                                setServiceStatusError('')
                              }
                            }}
                            style={{
                              width: '15px',
                              height: '15px',
                              accentColor: NGK_COLORS.primary, // Checkbox color
                              cursor: 'pointer',
                              marginTop: '3px',
                            }}
                          />

                          <div style={{ fontSize: '15px', color: '#555' }}>
                            <strong>Aadhaar Consent:</strong>
                            <p style={{ marginTop: '6px' }} className="text-muted">
                              <strong>{form.fullName}</strong> I hereby give explicit and voluntary
                              consent to <strong>Udit CosmeTech Private Limited</strong> to collect
                              and securely process my Aadhaar number for identity verification and
                              duplicate-account prevention purposes on Neeha’s Glow Kart. I have
                              read and understood the{' '}
                              <span
                                className="aadhaar-link"
                                onClick={() => setShowAadhaarModal(true)}
                              >
                                Aadhaar Consent Notice.
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* ERROR MESSAGE */}
                        {errors.aadhaarConsent && (
                          <p style={{ color: '#ff2e85', fontSize: '12px', marginTop: '4px' }}>
                            {errors.aadhaarConsent}
                          </p>
                        )}
                      </div>
                    </CCol>
                    {serviceStatusError && (
                      <p style={{ color: '#ff2e85', marginTop: '5px', fontSize: '14px' }}>
                        {serviceStatusError}
                      </p>
                    )}

                    {/* Consent */}
                    <CCol md={12}>
                      <div className="d-flex justify-content-between">
                        <CFormLabel>
                          Have you taken any dermatology related service [Botx, PRP, Laser, etc...]
                          in the last 12 months?
                        </CFormLabel>
                      </div>

                      <div
                        style={{ display: 'flex', gap: '20px' }}
                        className="d-flex justify-content-end"
                      >
                        <CButton
                          style={{
                            backgroundColor:
                              form.serviceStatus === '1' ? NGK_COLORS.primary : '#e4e4e4',
                            color: form.serviceStatus === '1' ? '#fff' : '#444',
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            transition: '0.25s',
                          }}
                          onClick={() => handleServiceStatusSelect('1')}
                        >
                          Yes
                        </CButton>

                        <CButton
                          style={{
                            backgroundColor:
                              form.serviceStatus === '2' ? NGK_COLORS.primary : '#e4e4e4',
                            color: form.serviceStatus === '2' ? '#fff' : '#444',
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            transition: '0.25s',
                          }}
                          onClick={() => handleServiceStatusSelect('2')}
                        >
                          No, Interested
                        </CButton>
                      </div>

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
                    {form.serviceStatus === '1' && (
                      <>
                        <CCol md={6}>
                          <CFormLabel className="label-gradient">
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
                          <CFormLabel className="label-gradient">
                            Clinic Area Pincode <span className="text-danger">*</span>
                          </CFormLabel>
                          <CFormInput
                            inputMode="numeric"
                            maxLength={6}
                            name="clinicCityArea"
                            placeholder="Enter Clinic City/Area pincode"
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
                          <CFormLabel className="label-gradient">
                            Last Visit Date <span className="text-danger">*</span>
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
                          <CFormLabel className="label-gradient">
                            Service Availed <span className="text-danger">*</span>
                          </CFormLabel>
                          <Select
                            options={procedureOptions}
                            isMulti
                            placeholder="Select services received..."
                            onChange={handleProcedureChange}
                            styles={selectStyles}
                            value={procedureOptions.filter(
                              (opt) =>
                                form.serviceType?.includes(opt.label) || // actual label
                                (opt.value === 'other' && form.serviceType.includes('other')),
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
                              <CFormLabel className="label-gradient">
                                Specify Other Service
                              </CFormLabel>
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
                          <CFormLabel className="label-gradient">
                            Upload your last visit receipt <span className="text-danger">*</span>
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
                                border: `2px dashed ${NGK_COLORS.primaryLight}`,
                                borderRadius: 12,
                                padding: '18px',
                                width: '100%',
                                textAlign: 'center',
                                display: 'block',
                                cursor: 'pointer',
                                background: NGK_COLORS.primarySoft,
                                color: NGK_COLORS.primary,
                                fontWeight: '500',
                                fontSize: 15,
                              }}
                            >
                              📁 Tap to upload receipt
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

                    {form.serviceStatus === '2' && (
                      <>
                        {/* Category Dropdown */}
                        <CCol md={6}>
                          <CFormLabel className="label-gradient">
                            Select Category <span className="text-danger">*</span>
                          </CFormLabel>
                          <CFormSelect
                            name="interestCategory"
                            value={form.interestCategory}
                            onChange={handleChange}
                          >
                            <option value="">Select...</option>
                            <option value="Skin">Skin</option>
                            <option value="Hair">Hair</option>
                            <option value="Laser">Laser</option>
                            <option value="Body">Body</option>
                            <option value="Other">Others</option>
                          </CFormSelect>
                          {errors.interestCategory && (
                            <p
                              style={{
                                color: '#ff2e85',
                              }}
                            >
                              {errors.interestCategory}
                            </p>
                          )}
                        </CCol>

                        {/* Problem or Procedure */}
                        <CCol md={6}>
                          <CFormLabel className="label-gradient">
                            Your Concern / Procedure <span className="text-danger">*</span>
                          </CFormLabel>

                          <Select
                            options={[
                              // remove any existing "Others" by checking label
                              ...procedureOptions.filter(
                                (op) => op.label.toLowerCase() !== 'others',
                              ),
                              { value: 'other', label: 'Others' }, // add one clean version
                            ]}
                            isMulti
                            placeholder="Select your concerns/procedures..."
                            value={[
                              ...procedureOptions.filter((opt) =>
                                form.problemDescription?.includes(opt.label),
                              ),
                              ...(form.problemDescription?.includes('other')
                                ? [{ value: 'other', label: 'Others' }]
                                : []),
                            ]}
                            onChange={(selected) => {
                              const labels = selected.map((item) =>
                                item.value === 'other' ? 'other' : item.label,
                              )

                              setForm((prev) => ({ ...prev, problemDescription: labels }))
                              setErrors((prev) => ({ ...prev, problemDescription: '' }))
                            }}
                            styles={selectStyles}
                          />

                          {errors.problemDescription && (
                            <p style={{ color: '#ff2e85' }}>{errors.problemDescription}</p>
                          )}

                          {/* Show Other input */}
                          {form.problemDescription?.includes('other') && (
                            <div style={{ marginTop: 10 }}>
                              <CFormLabel className="label-gradient">
                                Specify Other Concern
                              </CFormLabel>
                              <CFormInput
                                placeholder="Enter your concern"
                                value={form.otherServiceName}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    otherServiceName: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          )}
                        </CCol>

                        {/* Skin Tone */}
                        <CCol md={6}>
                          <CFormLabel className="label-gradient">
                            Your Skin Tone <span className="text-danger">*</span>
                          </CFormLabel>
                          <CFormInput
                            name="skinTone"
                            placeholder="Eg: Medium, Dusky, Fair..."
                            value={form.skinTone}
                            onChange={handleChange}
                          />
                          {errors.skinTone && (
                            <p
                              style={{
                                color: '#ff2e85',
                              }}
                            >
                              {errors.skinTone}
                            </p>
                          )}
                        </CCol>

                        {/* Upload Optional Photo */}
                        {/* <CCol md={6}>
                          <CFormLabel>Upload Photo (Optional)</CFormLabel>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0]
                              if (!file) return
                              const base64 = await processFile(file)
                              setForm((p) => ({ ...p, samplePhoto: base64 }))
                            }}
                          />
                          {form.samplePhoto && <UploadedPreview src={form.samplePhoto} />}
                        </CCol> */}

                        <CCol md={6}>
                          <CFormLabel className="label-gradient">
                            Upload Photo (Optional)
                          </CFormLabel>
                          <div
                            md={6}
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
                              📁 Upload Photo
                              <input
                                type="file"
                                accept="image/*, application/pdf"
                                onChange={async (e) => {
                                  const file = e.target.files[0]
                                  if (!file) return

                                  try {
                                    const base64 = await processFile(file)
                                    updateForm('samplePhoto', base64)
                                  } catch (err) {
                                    alert(err.message)
                                    e.target.value = ''
                                  }
                                }}
                                style={{ display: 'none' }}
                              />
                            </label>
                            {form.samplePhoto && <UploadedPreview src={form.samplePhoto} />}
                          </div>
                          <small style={{ color: '#888', display: 'block' }}>
                            Accepted formats: PDF, JPG, JPEG, PNG
                          </small>

                          {errors.samplePhoto && (
                            <div
                              style={{
                                color: '#ff2e85',
                              }}
                            >
                              {errors.samplePhoto}
                            </div>
                          )}
                        </CCol>
                      </>
                    )}

                    {/* Submit */}
                    {form.serviceStatus && (
                      <CCol md={12} className="mt-5 d-flex justify-content-end">
                        <CButton
                          style={{ background: NGK_COLORS.primary, color: '#fff' }}
                          disabled={!form.serviceStatus || loading}
                          type="submit"
                        >
                          {loading ? 'Submitting...' : 'Submit'}
                        </CButton>
                      </CCol>
                    )}
                  </CRow>
                )}
              </CForm>
            )}
          </div>
          {showAadhaarModal && (
            <div className="aadhaar-modal-backdrop text-black">
              <div className="aadhaar-modal">
                <h2>Aadhaar Consent Notice</h2>

                <div className="aadhaar-modal-content">
                  <p>
                    Udit CosmeTech Private Limited (“we”, “us”, “our”), the operator of the mobile
                    application Neeha’s Glow Kart, is committed to protecting your personal data in
                    accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act).
                    <br />
                    <br />
                    To ensure genuine, unique, and non-duplicate registrations, we request you to
                    voluntarily provide your Aadhaar Number for identity verification and
                    fraud-prevention purposes.
                    <br />
                    <br />
                    Please read the information below carefully before providing your consent.
                    <br />
                    <br />
                    <b>1. Purpose of Collecting Your Aadhaar Number</b>
                    <br />
                    Your Aadhaar number is collected solely for the following limited purposes:
                    <br />
                    <br />
                    • To ensure unique and genuine customer registration on Neeha’s Glow Kart.
                    <br />
                    • To prevent duplicate accounts, fraudulent sign-ups, misuse of
                    referral/spin-wheel rewards, or unauthorized benefits.
                    <br />
                    • To maintain the integrity and authenticity of users participating in the
                    platform.
                    <br />
                    <br />
                    We do NOT use Aadhaar for:
                    <br />
                    • Marketing
                    <br />
                    • Profiling
                    <br />
                    • Sharing with clinics, external agencies, or advertisers
                    <br />
                    • Any purpose other than identity uniqueness verification
                    <br />
                    <br />
                    <b>2. How Your Aadhaar Information Is Handled</b>
                    <br />
                    We follow strict security protocols:
                    <br />
                    <br />
                    • Your Aadhaar number is not stored in readable or plain-text form.
                    <br />
                    • Your Aadhaar is immediately converted into a secure one-way cryptographic hash
                    (SHA-256).
                    <br />
                    • Only the hashed value is stored to check uniqueness.
                    <br />
                    • The original Aadhaar number is discarded immediately after hashing.
                    <br />
                    <br />
                    We never share, disclose, or transfer your Aadhaar number or hash to any third
                    party.
                    <br />
                    <br />
                    <b>3. Voluntary Consent</b>
                    <br />
                    Providing your Aadhaar number is voluntary but may be required to access certain
                    features such as:
                    <br />
                    <br />
                    • Registration on an invite-only basis
                    <br />
                    • Eligibility for promotional rewards (e.g., spin wheel)
                    <br />
                    • Fraud-free participation in offers and benefits
                    <br />
                    <br />
                    <b>4. Your Rights Under the DPDP Act</b>
                    <br />
                    You have the right to:
                    <br />
                    <br />
                    • Withdraw your consent at any time
                    <br />
                    • Request deletion of your stored hashed Aadhaar identifier
                    <br />
                    • Access the details of how your data is processed
                    <br />
                    • Submit grievances regarding your personal data
                    <br />• <a href="mailto:support@ngkderma.com">support@ngkderma.com</a>
                    <br />
                    <br />
                    <b>Contact our Data Protection Officer (DPO):</b>
                    <br />
                    Email: support@uditcosmetech.com
                    <br />
                    Address: Udit CosmeTech Private Limited, 7/111E, Plot No. 80/1,P&K,Nest, Chil
                    SEZ IT Park Rd,Coimbatore North, Coimbatore, Tamil Nadu, India - 641035.
                    <br />
                    <br />
                    <b>5. Retention & Deletion Policy</b>
                    <br />
                    We retain only the hashed Aadhaar identifier and only as long as required.
                    <br />
                    <br />
                    <b>6. By Proceeding, You Consent to the Following:</b>
                    <br />
                    • You voluntarily provide your Aadhaar number.
                    <br />
                    • You understand the specific and limited purpose of collection.
                    <br />
                    • You agree to its secure hashing and processing.
                    <br />• You authorize Udit CosmeTech Private Limited to process your data in
                    accordance with the DPDP Act.
                  </p>
                </div>

                <button className="aadhaar-close-btn" onClick={() => setShowAadhaarModal(false)}>
                  Agree
                </button>
              </div>
            </div>
          )}

          {showConsentModal && (
            <div className="aadhaar-modal-backdrop">
              <div className="aadhaar-modal">
                {/* CLOSE ICON (Top Right) */}
                {/* <button className="close-icon-btn" onClick={() => setShowConsentModal(false)}>
                  ✕
                </button> */}

                <h2>User Consent Disclaimer</h2>

                <div className="aadhaar-modal-content">
                  <p>
                    <b>Neeha’s Glow Kart – Udit CosmeTech Private Limited</b>
                    <br />
                    <br />
                    <b>Disclaimer:</b>
                    <br />
                    Neeha’s Glow Kart is a listing and offer-discovery platform only. We do not
                    provide medical treatments, and we are not responsible for treatment results,
                    side effects, complications, or service quality at any clinic.
                    <br />
                    <br />
                    All dermatology, skin, hair, cosmetic, and aesthetic procedures involve risks.
                    <br />
                    <b>
                      All treatments are fully and solely the responsibility of the respective
                      clinic/doctor.
                    </b>
                    <br />
                    <br />
                    By continuing, you acknowledge and agree that:
                    <br />
                    <br />
                    • You choose to visit or consult a clinic at your own discretion and risk.
                    <br />
                    • Neeha’s Glow Kart is not liable for reactions, side effects, dissatisfaction,
                    or post-treatment issues.
                    <br />
                    • You will interact directly with the clinic for medical advice, risks,
                    aftercare, or disputes.
                    <br />
                    • The platform’s role is only to share offers & clinic information provided by
                    the clinics.
                    <br />
                    <br />
                  </p>
                </div>

                {/* BOTTOM CLOSE BUTTON */}
                <button className="aadhaar-close-btn" onClick={() => setShowConsentModal(false)}>
                  Agree
                </button>
              </div>
            </div>
          )}
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
