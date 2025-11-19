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
import { serviceDataH } from '../../ProcedureManagement/ProcedureManagementAPI'
import Select from 'react-select'
import { showCustomToast } from '../../../Utils/Toaster'
import LoadingIndicator from '../../../Utils/loader'
export default function NGlowKartPatientRegistration_CoreUI() {
  const today = new Date()
  const maxToday = today.toISOString().split('T')[0]

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(today.getFullYear() - 1)
  const oneYearAgoISO = oneYearAgo.toISOString().split('T')[0]

  const minLastVisitDate = new Date(today)
  minLastVisitDate.setMonth(today.getMonth() - 12)
  const minDate12Months = minLastVisitDate.toISOString().split('T')[0]
  const [aadharVerified, setAadharVerified] = useState(false)
  const dummyAadhar = '123456789012' // Change as needed
  const regCode = 'NGK-202517' // Change as needed
  const [winnerPrize, setWinnerPrize] = useState(null)
  const [showWheel, setShowWheel] = useState(true)
  const [instagram, setInstagram] = useState(false)
  const [isRegistration, setIsRegistration] = useState(true)
  const [spinWhell, setSpinWhell] = useState(false)
  const [error, setError] = useState('')
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
    priscription: '',

    // ⭐ ADD THESE TWO NEW FIELDS
    spinRewardId: '',
    spinRewardValue: '',
    spinRewardImage: '',

    prizePostScreenshot: '',
    followScreenshot: '',
    address: '',
  })

  const procedureOptions = [
    { value: 'botox', label: 'Botox' },
    { value: 'chemical_peel', label: 'Chemical Peel' },
    { value: 'laser_treatment', label: 'Laser Treatment' },
    { value: 'fillers', label: 'Fillers' },
    { value: 'microdermabrasion', label: 'Microdermabrasion' },
    { value: 'prp_hair', label: 'PRP Hair Treatment' },
    { value: 'facial', label: 'Facial Therapy' },
    { value: 'pigmentation_treatment', label: 'Pigmentation Treatment' },
    { value: 'acne_treatment', label: 'Acne Treatment' },
    { value: 'skin_rejuvenation', label: 'Skin Rejuvenation' },
    { value: 'tattoo_removal', label: 'Tattoo Removal' },
    { value: 'body_contouring', label: 'Body Contouring' },
    { value: 'derma_roller', label: 'Derma Roller' },
    { value: 'lip_lightening', label: 'Lip Lightening' },
    { value: 'skin_brightening', label: 'Skin Brightening' },
    { value: 'other', label: 'Other (Not Listed)' }, // Custom option
  ]

  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  function calculateAge(dobStr) {
    if (!dobStr) return 0
    const b = new Date(dobStr)
    let age = today.getFullYear() - b.getFullYear()
    const m = today.getMonth() - b.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--
    return age
  }
  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // useEffect(() => {
  //   serviceDataH()
  // }, [])

  const handleProcedureChange = (selected) => {
    // Update form with selected values (array of values)
    setForm((prev) => ({
      ...prev,
      serviceType: selected.map((s) => s.value),
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
    const value = e.target.value.toUpperCase() // auto uppercase
    setError('') // reset error while typing
    setForm((prev) => ({ ...prev, registraionCode: value }))
    setIsRegistration(value.trim().length > 0)
  }

  const handleSubmitReferralCode = () => {
    if (!form.registraionCode.trim()) {
      setError('⚠️ Please enter your registration code.')
      return
    }

    if (form.registraionCode.trim().toUpperCase() !== regCode.toUpperCase()) {
      setError('❌ Invalid registration code. Please try again.')
      return
    }

    // PASSING VALIDATION
    setError('')
    setIsRegistration(false)

    console.log('Referral Code Submitted:', form.registraionCode)

    // Optional success alert
    showCustomToast('🎉 Registration code verified successfully!')
  }

  function validate() {
    const e = {}

    if (!form.fullName) e.fullName = 'Full name is required'
    if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number'
    if (!form.city) e.city = 'City is required'

    if (!/^\d{12}$/.test(form.Aadhar)) e.Aadhar = 'Enter a valid 12-digit Aadhaar number'

    if (!form.dob) e.dob = 'Date of birth required'
    else if (calculateAge(form.dob) < 1) e.dob = 'Must be at least 1 year old'

    if (form.confirmedVisit) {
      if (!form.clinicName) e.clinicName = 'Clinic name required'
      if (!form.clinicCityArea) e.clinicCityArea = 'Clinic area required'

      if (!form.dateOfLastVisit) e.dateOfLastVisit = 'Last visit date required'
      else {
        if (form.dateOfLastVisit > maxToday) e.dateOfLastVisit = 'Future dates not allowed'
        else if (form.dateOfLastVisit < minDate12Months)
          e.dateOfLastVisit = 'Visit must be within last 12 months'
      }

      if (!form.serviceType) e.serviceType = 'Service required'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitted(true)
  }

  console.log('instagram :: ', instagram)
  console.log('instagram :: ', form)

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: '100vh',
        background: '#f8f0ee',
        overflow: 'hidden',
      }}
    >
      <div
        className="d-flex w-100"
        style={{
          height: '95vh',
          maxWidth: 1200,
          background: '#fff',
          overflow: 'hidden',
          borderRadius: 12,
          boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
        }}
      >
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
          className="thin-scroll form-panel"
          style={{
            width: '55%',
            height: '100%',
            overflowY: 'auto',
            padding: '40px 30px',
          }}
        >
          {/* HEADER */}
          <div className="d-flex align-items-start gap-3 mb-4">
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

          {/* SUCCESS MESSAGE */}
          {submitted ? (
            <div
              className="d-flex flex-column justify-content-center align-items-center"
              style={{
                height: '80%', // Full height of parent container
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
                        onResult={(winner) => {
                          console.log('WON:', winner)

                          setForm((prev) => ({
                            ...prev,
                            spinRewardId: winner.id,
                            spinRewardValue: winner.option,
                            spinRewardImage: winner.src,
                          }))

                          setWinnerPrize(winner)
                          setShowWheel(false) // HIDE WHEEL
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-100">
                  {instagram ? (
                    <PrizePostDetails
                      form={form}
                      setForm={setForm}
                      onSubmit={(data) => {
                        console.log('Address from user:', form)
                        // send data to backend or continue next step
                      }}
                    />
                  ) : (
                    <SpinResultCard
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
                    background: '#fff',
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
                        marginBottom: 14,
                        fontWeight: 700,
                        color: '#d81b60',
                        textAlign: 'center',
                      }}
                    >
                      Enter Your Registration Code
                    </h3>

                    <CFormInput
                      name="registraionCode"
                      value={form.registraionCode}
                      onChange={handleRefChange}
                      placeholder="Enter Registration Code"
                      style={{
                        borderRadius: 12,
                        height: 45,
                        border: '1px solid #e1cbe9',
                        background: '#faf8ff',
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
                      disabled={!isRegistration}
                    >
                      Submit Registration Code
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
                    {errors.fullName && <CAlert color="danger">{errors.fullName}</CAlert>}
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel>
                      Mobile <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      name="mobile"
                      placeholder="Enter Mobile Number"
                      maxLength={10}
                      value={form.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        handleChange({ target: { name: 'mobile', value } })
                      }}
                    />
                    {errors.mobile && <CAlert color="danger">{errors.mobile}</CAlert>}
                  </CCol>

                  {/* DOB + City */}
                  <CCol md={6}>
                    <CFormLabel>
                      DOB <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="date"
                      name="dob"
                      max={maxToday}
                      value={form.dob}
                      onFocus={(e) => {
                        const input = e.target
                        input.value = oneYearAgoISO
                        input.showPicker?.()
                        setTimeout(() => {
                          if (!form.dob) input.value = ''
                        }, 0)
                      }}
                      onChange={handleChange}
                    />
                    {errors.dob && <CAlert color="danger">{errors.dob}</CAlert>}
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
                    {errors.city && <CAlert color="danger">{errors.city}</CAlert>}
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
                        maxLength={12}
                        disabled={aadharVerified} // Disable after verification
                        value={form.Aadhar}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '') // only digits
                          handleChange({ target: { name: 'Aadhar', value } })

                          // when 12 digits entered → verify
                          if (value.length === 12) {
                            if (value === dummyAadhar) {
                              setAadharVerified(true)
                              setErrors((prev) => ({ ...prev, Aadhar: null }))
                            } else {
                              setAadharVerified(false)
                              setErrors((prev) => ({
                                ...prev,
                                Aadhar: 'Aadhaar number does not match',
                              }))
                            }
                          } else {
                            setAadharVerified(false)
                          }
                        }}
                        placeholder="Enter 12-digit Aadhaar number"
                      />

                      {aadharVerified && (
                        <span
                          style={{
                            background: '#ff4f9a',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                          }}
                        >
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Error */}
                    {errors.Aadhar && !aadharVerified && (
                      <CAlert color="danger">{errors.Aadhar}</CAlert>
                    )}
                  </CCol>

                  {/* Consent */}
                  <CCol md={12}>
                    <CFormCheck
                      className="custom-checkbox"
                      name="confirmedVisit"
                      checked={form.confirmedVisit}
                      onChange={handleChange}
                      label="I confirm that I have availed dermatology or cosmetic services from a verified clinic within the last 12 months and agree to N Glow Kart’s verification and data privacy policy"
                    />
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
                      </CCol>

                      <CCol md={6}>
                        <CFormLabel>
                          Last Visit <span className="text-danger">*</span>
                        </CFormLabel>
                        <CFormInput
                          type="date"
                          name="dateOfLastVisit"
                          max={maxToday}
                          min={minDate12Months}
                          value={form.dateOfLastVisit}
                          onChange={handleChange}
                        />
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
                          value={procedureOptions.filter((opt) =>
                            form.serviceType?.includes(opt.value),
                          )}
                        />

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
                      <div style={{ marginBottom: 25 }}>
                        <CFormLabel>
                          Upload your last visit bill or prescription{' '}
                          <span className="text-danger">*</span>
                        </CFormLabel>

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
                            accept="image/*"
                            onChange={(e) => updateForm('priscription', e.target.files[0])}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    </>
                  )}

                  {/* Submit */}
                  <CCol md={12} className="mt-3 d-flex justify-content-end">
                    <CButton
                      style={{ background: '#ff4f9a', color: '#fff' }}
                      disabled={!form.confirmedVisit}
                      type="submit"
                    >
                      Register
                    </CButton>
                  </CCol>
                </CRow>
              )}
            </CForm>
          )}
        </div>
      </div>
    </div>
  )
}
