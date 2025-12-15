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
import bgLogo from '../../../assets/images/bgLogo.png'
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
import { BASE_URL, wifiUrl } from '../../../baseUrl'
import AadhaarConsentModal from './AadhaarConsentModal'
import UserConsentModal from './UserConsentModal'
export default function NGlowKartPatientRegistration_CoreUI() {
  //   const today = new Date()
  const today = new Date()
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())

  const eighteenYearsAgoISO = eighteenYearsAgo.toISOString().split('T')[0]
  const hundredYearsAgo = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
  const hundredYearsAgoISO = hundredYearsAgo.toISOString().split('T')[0]

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
  const [cityList, setCityList] = useState([])
  const [highlightAadhaarConsent, setHighlightAadhaarConsent] = useState(false)

  const indianSkinTones = [
    { value: 'Very Fair', label: 'Very Fair' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Wheatish', label: 'Wheatish' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Dusky', label: 'Dusky' },
    { value: 'Dark', label: 'Dark' },
    { value: 'Other', label: 'Other' },
  ]

  const STATE_CITY_MAP = {
    Telangana: ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Erode'],
    Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'],
    Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
    Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  }

  const cityOptions = Object.values(STATE_CITY_MAP)
    .flat()
    .map((city) => ({
      label: city,
      value: city,
    }))

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

  // useEffect(() => {
  //   // smooth scroll window (fallback)
  //   window.scrollTo({ top: 0, behavior: 'smooth' })

  //   // smooth scroll the scrollable container
  //   const panel = document.querySelector('.form-panel')
  //   if (panel) {
  //     panel.scrollTo({ top: 0, behavior: 'smooth' })
  //   }
  // }, [])

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    city: '',
    otherCity: '',
    dob: '',

    clinicName: '',
    clinicCityArea: '',
    dateOfLastVisit: '',
    serviceType: [],
    blood: '',
    registraionCode: '',
    // referBy: '',
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
    otherInterestCategory: '',
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

  const serviceStatusRef = React.useRef(null)

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
    setErrors((prev) => ({ ...prev, serviceType: null }))
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

  // useEffect(() => {
  //   async function fetchCities() {
  //     try {
  //       const res = await fetch(`${wifiUrl}/api/customer/cities`, { cache: 'no-store' })

  //       if (!res.ok) {
  //         throw new Error('Server error')
  //       }

  //       const json = await res.json()

  //       if (json.success) setCityList(json.data)
  //     } catch (err) {
  //       console.log('City fetch error:', err)
  //       showCustomToast('⚠️ Unable to fetch city list. Check your internet.', 'error')
  //     }
  //   }

  //   fetchCities()
  // }, [])

  async function fetchCities() {
    try {
      const res = await fetch(`${wifiUrl}/api/customer/cities`, { cache: 'no-store' })
      console.log(res)
      if (!res.ok) {
        throw new Error('Server error')
      }

      const json = await res.json()

      if (json.success) setCityList(json.data)
    } catch (err) {
      console.log('City fetch error:', err)
      showCustomToast('⚠️ Unable to fetch city list. Check your internet.', 'error')
    }
  }

  //   const [cityOptions, setCityOptions] = useState([])
  // const [loadingCities, setLoadingCities] = useState(false)

  // const fetchCities = async () => {
  //   try {
  //     setLoadingCities(true)
  //     const res = await axios.get('/api/cities')

  //     // Merge all state cities into one list
  //     const allCities = Object.values(res.data.data).flat()

  //     setCityOptions(allCities)
  //   } catch (error) {
  //     console.error('City API error', error)
  //   } finally {
  //     setLoadingCities(false)
  //   }
  // }

  const hasFetchedRef = React.useRef(false)

  if (!hasFetchedRef.current) {
    const navEntry = performance.getEntriesByType('navigation')[0]

    if (navEntry?.type === 'reload') {
      fetchCities()
    }

    hasFetchedRef.current = true
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

      const result = await verifyRegistrationCode(code)
      console.log('Verify Code Result:', result)

      // ❌ If verification failed → STOP HERE
      if (!result.success) {
        setError(result.message || '❌ Invalid registration code.')
        return // ⛔ IMPORTANT — do not continue
      }

      // ✔ If success, show toast + load cities
      showCustomToast(result.message || '🎉 Registration code verified!', 'success')
      await fetchCities()
      // await new Promise((res) => setTimeout(res, 200))

      // ⭐ SAFETY CHECK: Only apply backend status if data exists
      // if (result.data) {
      //   applyBackendStatus(result.data)
      // } else {
      //   console.warn('No backend (status) data returned, skipping applyBackendStatus.')
      // }

      applyBackendStatus(result.data)

      // 3️⃣ Fetch customer details
      const customerRes = await getCustomerByCode(code)

      if (customerRes.success) {
        const customer = customerRes.data
        setUserData(customer)
      }
      // ⭐ NOW call backend status
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
    // if (!form.city) e.city = 'City is required'

    if (!form.city) {
      e.city = 'City is required'
    } else if (form.city === 'other' && !form.otherCity.trim()) {
      e.otherCity = 'Please enter your city name'
    }

    if (!/^\d{12}$/.test(form.Aadhar)) e.Aadhar = 'Enter a valid 12-digit Aadhaar number'

    if (!form.dob) e.dob = 'Date of birth required'
    if (!form.gender) e.gender = 'gender required'
    else if (calculateAge(form.dob) < 18) e.dob = 'Must be at least 18 years old'

    if (form.serviceStatus == '1') {
      if (!form.clinicName) e.clinicName = 'Clinic name required'
      if (!/^\d{6}$/.test(form.clinicCityArea)) {
        e.clinicCityArea = 'Pincode must be exactly 6 digits.'
      }

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

      // if (!form.serviceType) e.serviceType = 'Service required'
      if (!form.serviceType || form.serviceType.length === 0) e.serviceType = 'Service required'
      if (form.serviceType.includes('other') && !form.otherServiceName.trim()) {
        e.otherServiceName = 'Please specify the service'
      }

      if (!form.prescription)
        e.prescription = 'Please upload your receipt (PDF, JPG, JPEG, or PNG).'
    }
    // ✔ INTERESTED FLOW – Validate interest info
    if (form.serviceStatus === '2') {
      if (!form.interestCategory) {
        e.interestCategory = 'Please select a category'
      } else if (form.interestCategory === 'Other' && !form.otherInterestCategory.trim()) {
        e.otherInterestCategory = 'Please specify the category'
      }

      if (!form.problemDescription || form.problemDescription.length === 0)
        e.problemDescription = 'Please select at least one concern'

      if (form.problemDescription.includes('other') && !form.otherServiceName.trim()) {
        e.otherServiceName = 'Please specify your concern'
      }

      if (!form.skinTone) e.skinTone = 'Please select your skin tone'
      // if (!form.skinToneOther.trim()) {
      //   e.skinToneOther = 'Please enter your skin tone'
      // }

      // samplePhoto optional
    }

    if (!form.aadhaarConsent)
      e.aadhaarConsent = 'You must accept Aadhaar consent before submitting.'

    if (!form.userConsent) e.userConsent = 'You must agree to the User Consent Disclaimer.'

    setErrors(e)
    // scrollToFirstError(e)
    return { valid: Object.keys(e).length === 0, errorObj: e }
  }

  const inputRefs = {
    fullName: React.useRef(null),
    mobile: React.useRef(null),
    Aadhar: React.useRef(null),
    dob: React.useRef(null),
    city: React.useRef(null),
    cityOther: React.useRef(null),
    clinicName: React.useRef(null),
    clinicCityArea: React.useRef(null),
    dateOfLastVisit: React.useRef(null),
    serviceType: React.useRef(null),
    interestCategory: React.useRef(null),
    problemDescription: React.useRef(null),
    skinTone: React.useRef(null),
    gender: React.useRef(null),
    skinToneOther: React.useRef(null),
    prescription: React.useRef(null),
    otherServiceName: React.useRef(null),
    otherCity: React.useRef(null),
  }

  async function handleSubmit(e) {
    e.preventDefault()
    // 1️⃣ Check serviceStatus explicitly
    if (!form.serviceStatus) {
      setServiceStatusError('Please choose Yes or No before submitting.')
      return
    } else {
      setServiceStatusError('')
    }

    // 2️⃣ Validate all fields
    const { valid, errorObj } = validate()
    if (!valid) {
      scrollToFirstError(errorObj)
      return
    }

    const payload = {
      fullName: form.fullName,
      mobile: form.mobile,
      email: form.email,
      city: form.city === 'other' ? form.otherCity : form.city,
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
      // referBy: form.referBy,
      gender: form.gender,
      serviceStatus: form.serviceStatus,
      concern: form.problemDescription.map((item) =>
        item === 'other' ? form.otherServiceName : item,
      ),
      category: form.interestCategory,
      skinTone: form.skinTone === 'other' ? form.skinToneOther : form.skinTone,
      photo: form.samplePhoto,
      aadhaarConsent: form.aadhaarConsent,
      userConsent: form.userConsent,
      privacyConsent: form.privacyConsent,
    }

    console.log(form)
    console.log(
      form.problemDescription.map((item) => (item === 'other' ? form.otherServiceName : item)),
    )

    setLoading(true)
    try {
      const result = await registerCustomer(payload)
      console.log(result)
      const newErrors = { ...errors }
      if (!result.success) {
        const backendMessage = result.message || 'Something went wrong'
        if (backendMessage.toLowerCase().includes('mobile')) {
          newErrors.mobile = backendMessage
        } else if (backendMessage.toLowerCase().includes('aadhaar')) {
          newErrors.Aadhar = backendMessage
        }
        setErrors(newErrors)
        scrollToFirstError(newErrors)
        showCustomToast(`${result.message}` || '❌ Registration failed!', 'error')
        return
      } else {
        showCustomToast(`${result.message}` || `Some filed not filled`, 'success')
      }
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
    setTimeout(() => {
      if (serviceStatusRef.current) {
        serviceStatusRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    }, 200)
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

  const scrollToFirstError = (errorsObject) => {
    const firstErrorField = Object.keys(errorsObject).find((key) => errorsObject[key])

    if (firstErrorField && inputRefs[firstErrorField]?.current) {
      inputRefs[firstErrorField].current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      // Also focus the field (optional)
      inputRefs[firstErrorField].current.focus()
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center w-100 bg"
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
            backgroundImage: `url(${bgLogo})`,
            backgroundSize: 'fill',
            backgroundPosition: 'bottom',
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
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: '80vh', // Vertically centers
                          textAlign: 'center',
                          padding: '20px',
                        }}
                      >
                        <div className="header-container mb-5 justify-content-start align-items-center d-flex flex-column">
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
                        <div>
                          <h3 className="fw-bold" style={{ color: NGK_COLORS.primary }}>
                            🎉 Verification Pending
                          </h3>

                          <p
                            className="mt-2"
                            style={{
                              maxWidth: 380,
                              color: NGK_COLORS.primaryLight,
                              margin: '0 auto',
                            }}
                          >
                            Thanks for joining Neeha's Glow Kart!! Verification is underway. You can
                            spin now, and rewards will be dispatched after successful verification.
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
                  <div className="w-100  ">
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
                  <>
                    {/* <h4 className="m-0 fw-bold text-center w-100 gradient-text"></h4> */}
                    <div className="header-container justify-content-center align-items-center d-flex flex-column">
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

                      <h4 className="m-0 fw-bold text-center w-100 gradient-text">Registration</h4>

                      {/* <h4 className="m-0 fw-bold text-center w-100 gradient-text">Registration</h4> */}
                      {/* <small className="sub-gradient-text">Registration</small> */}
                    </div>
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
                      <div className="registraionCodeClass">
                        <CFormInput
                          name="registraionCode"
                          value={form.registraionCode}
                          onChange={handleRefChange}
                          placeholder="Enter Registration Code"
                          className="registraionCodeInput"
                        />

                        {/* Error message */}
                        {error && (
                          <p
                            style={{
                              color: 'red',
                              fontSize: 13,
                              fontWeight: 600,

                              marginBottom: 10,
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
                            color: NGK_COLORS.primary,
                          }}
                        >
                          Early access members will receive free gifts by spinning the wheel.
                          Provide valid registration details and get a free spin for a chance to win
                          amazing prizes.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="header-container">
                      <div className=" justify-content-start align-items-center d-flex flex-column">
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

                        <h4 className="m-0 fw-bold text-center w-100 gradient-text">
                          Registration
                        </h4>

                        {/* <h4 className="m-0 fw-bold text-center w-100 gradient-text">Registration</h4> */}
                        {/* <small className="sub-gradient-text">Registration</small> */}
                      </div>

                      {/* <h4 className="m-0 fw-bold text-center w-100 gradient-text">Registration</h4> */}
                      {/* <small className="sub-gradient-text">Registration</small> */}
                    </div>
                    <CRow className="g-4 mt-4">
                      {/* Full Name + Mobile */}
                      <CCol md={6}>
                        <CFormLabel
                          className="label-gradient "
                          style={{ color: NGK_COLORS.primarySoft }}
                        >
                          Full Name (As Per Aadhaar Card) <span className="text-danger">*</span>
                        </CFormLabel>
                        <CFormInput
                          ref={inputRefs.fullName}
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          placeholder="Enter Full Name"
                        />
                        {errors.fullName && (
                          <p
                            style={{
                              color: 'red',
                            }}
                          >
                            {errors.fullName}
                          </p>
                        )}
                      </CCol>

                      <CCol md={6}>
                        <CFormLabel
                          className="label-gradient  "
                          style={{ color: NGK_COLORS.primarySoft }}
                        >
                          Mobile Number <span className="text-danger">*</span>
                        </CFormLabel>
                        <CFormInput
                          ref={inputRefs.mobile}
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
                              color: 'red',
                            }}
                          >
                            {errors.mobile}
                          </p>
                        )}
                      </CCol>

                      {/* DOB + City */}

                      <CCol md={6}>
                        <CFormLabel
                          className="label-gradient "
                          style={{ color: NGK_COLORS.primarySoft }}
                        >
                          Gender
                        </CFormLabel>
                        <CFormSelect
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          ref={inputRefs.gender}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Others">Others</option>
                        </CFormSelect>

                        {errors.gender && <p style={{ color: 'red' }}>{errors.gender}</p>}
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel
                          className=" label-gradient"
                          style={{ color: NGK_COLORS.primarySoft }}
                        >
                          Date of birth <span className="text-danger">*</span>
                        </CFormLabel>

                        <div style={{ position: 'relative' }}>
                          {!form.dob && (
                            <span
                              style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                color: '#999',
                              }}
                            >
                              dd/mm/yyyy
                            </span>
                          )}

                          <CFormInput
                            id="dobInput"
                            type="date"
                            name="dob"
                            value={form.dob}
                            ref={inputRefs.dob}
                            min={hundredYearsAgoISO}
                            max={eighteenYearsAgoISO}
                            style={{ position: 'relative', zIndex: 2 }}
                            onFocus={(e) => {
                              const input = e.target

                              // ✅ iOS FIX: force picker to open at 18+ date
                              if (!form.dob) {
                                input.value = eighteenYearsAgoISO
                              }

                              input.showPicker?.()

                              // if user cancels, clear value
                              setTimeout(() => {
                                if (!form.dob) input.value = ''
                              }, 0)
                            }}
                            onChange={handleChange}
                          />

                          {/* Calendar icon */}
                          <span
                            onClick={() => document.getElementById('dobInput')?.showPicker?.()}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              cursor: 'pointer',
                              fontSize: '20px',
                              color: NGK_COLORS.primarySoft,
                              zIndex: 3,
                            }}
                          >
                            📅
                          </span>
                        </div>

                        {errors.dob && <p style={{ color: 'red' }}>{errors.dob}</p>}
                      </CCol>

                      {/* <CCol md={6}>
                        <CFormLabel
                          className="label-gradient "
                          style={{ color: NGK_COLORS.primarySoft }}
                        >
                          City <span className="text-danger">*</span>
                        </CFormLabel>
                        <div ref={inputRefs.city}>
                          <Select
                            styles={{ color: 'black' }}
                            name="city"
                            value={form.city ? { label: form.city, value: form.city } : null}
                            onChange={(selected) => {
                              handleChange({
                                target: { name: 'city', value: selected?.value || '' },
                              })
                            }}
                            options={[
                              ...cityList.map((city) => ({ label: city, value: city })),
                              { label: 'Other', value: 'other' },
                            ]}
                            placeholder="Select or Search City"
                            isSearchable
                          />
                        </div>
                      
                        {form.city === 'other' && (
                          <CFormInput
                            ref={inputRefs.otherCity}
                            className="mt-2"
                            placeholder="Enter City / Area"
                            value={form.otherCity || ''}
                            onChange={(e) => {
                              const val = e.target.value
                              setForm((prev) => ({
                                ...prev,
                                otherCity: val,
                              }))
                              setErrors((prev) => ({ ...prev, otherCity: null }))
                            }}
                          />
                        )}
                        {errors.otherCity && <p style={{ color: 'red' }}>{errors.otherCity}</p>}

                        {errors.city && <p style={{ color: 'red' }}>{errors.city}</p>}
                      </CCol> */}
                      <CCol md={6}>
                        <CFormLabel
                          className="label-gradient"
                          style={{ color: NGK_COLORS.primarySoft }}
                        >
                          City <span className="text-danger">*</span>
                        </CFormLabel>

                        <Select
                          placeholder="Select or Search City"
                          isSearchable
                          value={form.city ? { label: form.city, value: form.city } : null}
                          onChange={(selected) => {
                            setForm((prev) => ({
                              ...prev,
                              city: selected?.value || '',
                              otherCity: '',
                            }))
                            setErrors((prev) => ({ ...prev, city: null }))
                          }}
                          options={[...cityOptions, { label: 'Other', value: 'other' }]}
                          styles={selectStyles}
                        />

                        {/* Other city input */}
                        {form.city === 'other' && (
                          <CFormInput
                            className="mt-2"
                            placeholder="Enter your city"
                            value={form.otherCity}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, otherCity: e.target.value }))
                            }
                          />
                        )}

                        {errors.city && <p style={{ color: 'red' }}>{errors.city}</p>}
                        {errors.otherCity && <p style={{ color: 'red' }}>{errors.otherCity}</p>}
                      </CCol>

                      {/* {errors.city && <p style={{ color: '#ff2e85' }}>{errors.city}</p>} */}

                      <CCol md={6}>
                        <CFormLabel
                          className="label-gradient "
                          style={{ color: NGK_COLORS.primarySoft }}
                        >
                          Aadhaar Card Number <span className="text-danger">*</span>
                        </CFormLabel>

                        <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                          <CFormInput
                            ref={inputRefs.Aadhar}
                            name="Aadhar"
                            inputMode="numeric"
                            maxLength={12}
                            value={form.Aadhar}
                            placeholder="Enter 12-digit Aadhaar number"
                            onFocus={() => {
                              if (!form.aadhaarConsent) {
                                showCustomToast(
                                  '⚠️ Please accept Aadhaar consent before entering Aadhaar number',
                                  'error',
                                )

                                // highlight consent section
                                setHighlightAadhaarConsent(true)

                                // remove highlight after 2 seconds
                                setTimeout(() => setHighlightAadhaarConsent(false), 2000)

                                // move user to consent section
                                inputRefs.aadhaarConsent?.current?.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'center',
                                })
                              }
                            }}
                            onChange={(e) => {
                              if (!form.aadhaarConsent) return // ❌ block typing

                              const value = e.target.value.replace(/\D/g, '')
                              handleChange({ target: { name: 'Aadhar', value } })

                              if (value.length === 12) {
                                setErrors((prev) => ({ ...prev, Aadhar: null }))
                                setAadharVerified(true)
                              } else {
                                setAadharVerified(false)
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
                            disabled={!form.aadhaarConsent}
                          />
                        </div>
                        {!form.aadhaarConsent && (
                          <p style={{ color: '#ff2e85', fontSize: '12px' }}>
                            Please accept Aadhaar consent to enable this field
                          </p>
                        )}

                        {errors.Aadhar && (
                          <p
                            style={{
                              color: 'red',
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
                          I have read and understood{' '}
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
                              style={{
                                width: '15px',
                                height: '15px',
                                accentColor: NGK_COLORS.primary, // Checkbox color
                                cursor: 'pointer',
                                marginTop: '3px',
                                backgroundColor: highlightAadhaarConsent
                                  ? '#fff3f6'
                                  : 'transparent',
                                borderRadius: '10px',
                                padding: highlightAadhaarConsent ? '10px' : '0',
                                transition: 'all 0.3s ease',
                              }}
                              onChange={(e) => {
                                setForm({ ...form, aadhaarConsent: e.target.checked })

                                // remove error when checked
                                if (e.target.checked) {
                                  setErrors((prev) => ({ ...prev, aadhaarConsent: '' }))
                                  setServiceStatusError('')
                                }
                              }}
                            />

                            <div style={{ fontSize: '15px', color: '#555' }}>
                              <strong>Aadhaar Consent:</strong>
                              <p style={{ marginTop: '6px' }} className="text-muted">
                                <strong>{form.fullName}</strong>, I hereby give explicit and
                                voluntary consent to <strong>Udit CosmeTech Private Limited</strong>{' '}
                                to collect and securely process my Aadhaar number for identity
                                verification and duplicate-account prevention purposes on Neeha’s
                                Glow Kart. I have read and understood the{' '}
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
                            <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                              {errors.aadhaarConsent}
                            </p>
                          )}
                        </div>
                      </CCol>
                      {serviceStatusError && (
                        <p style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>
                          {serviceStatusError}
                        </p>
                      )}

                      {/* Consent */}
                      <CCol md={12} ref={serviceStatusRef}>
                        <div className="d-flex justify-content-between">
                          <CFormLabel>
                            Have you taken any dermatology related service [Botox, PRP, Laser,
                            etc...] in the last 12 months?
                          </CFormLabel>
                        </div>

                        <div
                          style={{ display: 'flex', gap: '20px' }}
                          className="d-flex justify-content-center"
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
                            No, I'm Interested
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
                            <CFormLabel
                              className="label-gradient"
                              style={{ color: NGK_COLORS.primarySoft }}
                            >
                              Clinic Name <span className="text-danger">*</span>
                            </CFormLabel>
                            <CFormInput
                              ref={inputRefs.clinicName}
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
                            <CFormLabel
                              className="label-gradient"
                              style={{ color: NGK_COLORS.primarySoft }}
                            >
                              Clinic Area Pincode <span className="text-danger">*</span>
                            </CFormLabel>

                            <CFormInput
                              ref={inputRefs.clinicCityArea}
                              name="clinicCityArea"
                              placeholder="Enter 6-digit pincode"
                              value={form.clinicCityArea}
                              maxLength={6}
                              inputMode="numeric"
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '') // allow only digits
                                if (value.length > 6) value = value.slice(0, 6) // max 6 digits
                                handleChange({ target: { name: 'clinicCityArea', value } })
                              }}
                            />

                            {errors.clinicCityArea && (
                              <p style={{ color: 'red' }}>{errors.clinicCityArea}</p>
                            )}
                          </CCol>

                          {/* <CCol md={6}>
                            <CFormLabel
                              className="label-gradient"
                              style={{ color: NGK_COLORS.primarySoft }}
                            >
                              Last Visit Date <span className="text-danger">*</span>
                            </CFormLabel>

                            <CFormInput
                              ref={inputRefs.dateOfLastVisit}
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
                          </CCol> */}

                          <CCol md={6}>
                            <CFormLabel
                              className="label-gradient"
                              style={{ color: NGK_COLORS.primarySoft }}
                            >
                              Last Visit Date <span className="text-danger">*</span>
                            </CFormLabel>

                            <div style={{ position: 'relative' }}>
                              {/* Placeholder dd/mm/yyyy (only when input is empty) */}
                              {!form.dateOfLastVisit && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    color: '#999',
                                  }}
                                >
                                  dd/mm/yyyy
                                </span>
                              )}

                              <CFormInput
                                id="lastVisitInput"
                                ref={inputRefs.dateOfLastVisit}
                                type="date"
                                name="dateOfLastVisit"
                                max={maxToday} // today
                                min={minDate12Months} // today - 1 year
                                value={form.dateOfLastVisit}
                                style={{ position: 'relative', zIndex: 2 }}
                                onFocus={(e) => {
                                  const input = e.target
                                  input.value = maxToday // show today when opening picker
                                  input.showPicker?.()
                                  setTimeout(() => {
                                    if (!form.dateOfLastVisit) input.value = ''
                                  }, 0)
                                }}
                                onChange={handleChange}
                              />

                              {/* 📅 Calendar icon (tap to open picker) */}
                              <span
                                onClick={() =>
                                  document.getElementById('lastVisitInput')?.showPicker?.()
                                }
                                style={{
                                  position: 'absolute',
                                  right: '9px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  cursor: 'pointer',
                                  fontSize: '20px',
                                  color: NGK_COLORS.primarySoft,
                                  zIndex: 3,
                                }}
                              >
                                📅
                              </span>
                            </div>

                            {errors.dateOfLastVisit && (
                              <p style={{ color: 'red' }}>{errors.dateOfLastVisit}</p>
                            )}
                          </CCol>

                          <CCol md={6}>
                            <CFormLabel
                              className="label-gradient"
                              style={{ color: NGK_COLORS.primarySoft }}
                            >
                              Service Availed <span className="text-danger">*</span>
                            </CFormLabel>

                            <div ref={inputRefs.serviceType}>
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
                            </div>

                            {errors.serviceType && (
                              <p
                                style={{
                                  color: 'red',
                                }}
                              >
                                {errors.serviceType}
                              </p>
                            )}
                            {/* Other input */}
                            {showOtherInput && (
                              <div style={{ marginTop: 10 }}>
                                {/* <CFormLabel
                                  className="label-gradient"
                                  style={{ color: NGK_COLORS.primarySoft }}
                                >
                                  Specify Other Service
                                </CFormLabel> */}
                                <CFormInput
                                  ref={inputRefs.otherServiceName}
                                  placeholder="Enter Service Name"
                                  value={form.otherServiceName || ''}
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
                          <div>
                            <CFormLabel
                              className="label-gradient "
                              style={{ color: NGK_COLORS.primarySoft }}
                            >
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
                                  // background: NGK_COLORS.primarySoft,
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
                                      setErrors((prev) => ({ ...prev, prescription: null }))
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
                                color: 'red',
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
                            <CFormLabel
                              className="label-gradient"
                              style={{ color: NGK_COLORS.primarySoft }}
                            >
                              Select Category <span className="text-danger">*</span>
                            </CFormLabel>
                            <CFormSelect
                              name="interestCategory"
                              value={form.interestCategory}
                              onChange={(e) => {
                                handleChange(e)

                                // reset custom input when switching away from Other
                                if (e.target.value !== 'Other') {
                                  setForm((prev) => ({
                                    ...prev,
                                    otherInterestCategory: '',
                                  }))
                                }
                              }}
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
                                  color: 'red',
                                }}
                              >
                                {errors.interestCategory}
                              </p>
                            )}
                            {form.interestCategory === 'Other' && (
                              <div className="mt-2">
                                <CFormInput
                                  ref={inputRefs.otherInterestCategory}
                                  placeholder="Please specify category"
                                  value={form.otherInterestCategory}
                                  onChange={(e) => {
                                    setForm((prev) => ({
                                      ...prev,
                                      otherInterestCategory: e.target.value,
                                    }))
                                    setErrors((prev) => ({ ...prev, otherInterestCategory: null }))
                                  }}
                                />
                              </div>
                            )}

                            {errors.otherInterestCategory && (
                              <p style={{ color: 'red' }}>{errors.otherInterestCategory}</p>
                            )}
                          </CCol>

                          {/* Problem or Procedure */}
                          <CCol md={6}>
                            <CFormLabel
                              className="label-gradient"
                              style={{ color: NGK_COLORS.primarySoft }}
                            >
                              Your Concern / Procedure <span className="text-danger">*</span>
                            </CFormLabel>

                            <div ref={inputRefs.problemDescription}>
                              <Select
                                options={[
                                  // remove any existing "Others" by checking label
                                  ...procedureOptions.filter(
                                    (op) => op.label.toLowerCase() !== 'others',
                                  ),
                                  { value: 'other', label: 'Others' }, // add one clean version
                                ]}
                                isMulti
                                placeholder="your concerns/procedures..."
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
                            </div>

                            {errors.problemDescription && (
                              <p style={{ color: 'red' }}>{errors.problemDescription}</p>
                            )}

                            {/* Show Other input */}
                            {form.problemDescription?.includes('other') && (
                              <div style={{ marginTop: 10 }}>
                                {/* <CFormLabel
                                  className="label-gradient"
                                  style={{ color: NGK_COLORS.primarySoft }}
                                >
                                  Specify Other Concern
                                </CFormLabel> */}
                                <CFormInput
                                  ref={inputRefs.otherServiceName}
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
                            {errors.otherServiceName && (
                              <p style={{ color: 'red' }}>{errors.otherServiceName}</p>
                            )}
                          </CCol>

                          <CCol md={6}>
                            <CFormLabel
                              className="label-gradient"
                              style={{ color: NGK_COLORS.primarySoft }}
                            >
                              Your Skin Tone <span className="text-danger">*</span>
                            </CFormLabel>

                            <CFormSelect
                              name="skinTone"
                              value={form.skinTone}
                              onChange={(e) => {
                                const value = e.target.value
                                handleChange(e)

                                // If user selects "other", open input box & clear old value
                                if (value === 'other') {
                                  setForm((prev) => ({ ...prev, skinToneOther: '' }))
                                }
                              }}
                            >
                              <option value="">Select Skin Tone</option>
                              {indianSkinTones.map((tone) => (
                                <option key={tone.value} value={tone.value}>
                                  {tone.label}
                                </option>
                              ))}
                            </CFormSelect>

                            {errors.skinTone && <p style={{ color: 'red' }}>{errors.skinTone}</p>}

                            {/* Show input only when "other" is selected */}
                            {form.skinTone === 'other' && (
                              <div style={{ marginTop: 10 }}>
                                <CFormLabel
                                  className="label-gradient  "
                                  style={{ color: NGK_COLORS.primarySoft }}
                                >
                                  Specify Other Skin Tone
                                </CFormLabel>

                                <CFormInput
                                  ref={inputRefs.skinToneOther}
                                  placeholder="Enter your skin tone"
                                  value={form.skinToneOther || ''}
                                  onChange={(e) =>
                                    setForm((prev) => ({ ...prev, skinToneOther: e.target.value }))
                                  }
                                />
                              </div>
                            )}
                            {errors.skinToneOther && (
                              <p style={{ color: 'red' }}>{errors.skinToneOther}</p>
                            )}
                          </CCol>

                          <CCol md={6}>
                            <CFormLabel
                              className="label-gradient  "
                              style={{ color: NGK_COLORS.primarySoft }}
                            >
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
                                      setErrors((prev) => ({ ...prev, samplePhoto: null }))
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
                            type="submit"
                            disabled={loading} // <-- Remove serviceStatus check HERE
                          >
                            {loading ? 'Submitting...' : 'Submit'}
                          </CButton>
                        </CCol>
                      )}
                    </CRow>
                  </>
                )}
              </CForm>
            )}
          </div>
          {/* {showAadhaarModal && (
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
          )} */}

          <AadhaarConsentModal show={showAadhaarModal} onClose={() => setShowAadhaarModal(false)} />

          <UserConsentModal show={showConsentModal} onClose={() => setShowConsentModal(false)} />

          {/* {showConsentModal && (
            <div className="aadhaar-modal-backdrop">
              <div className="aadhaar-modal">
            

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

             
                <button className="aadhaar-close-btn" onClick={() => setShowConsentModal(false)}>
                  Agree
                </button>
              </div>
            </div>
          )} */}
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
