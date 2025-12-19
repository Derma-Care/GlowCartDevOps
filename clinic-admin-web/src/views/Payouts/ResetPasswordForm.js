import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CButton, CFormInput, CFormLabel } from '@coreui/react'
import DermaCareLogo from '../../assets/images/logoP.png'

export default function ResetPasswordScreen({ onRequestOtp, onVerifyOtp, onUpdatePassword }) {
  // ---------------- TEMP DATA FROM SESSION STORAGE ----------------
  const [step, setStep] = useState(Number(sessionStorage.getItem('reset_step')) || 1)

  const [email, setEmail] = useState(sessionStorage.getItem('reset_email') || '')
  const [otp, setOtp] = useState(sessionStorage.getItem('reset_otp') || '')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [emailError, setEmailError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  // AUTO-SAVE TEMP DATA
  useEffect(() => sessionStorage.setItem('reset_email', email), [email])
  useEffect(() => sessionStorage.setItem('reset_otp', otp), [otp])
  useEffect(() => sessionStorage.setItem('reset_step', step), [step])

  // ------------------ STEP 1: SEND OTP ------------------
  const handleSendOtp = async () => {
    setEmailError('')

    if (!email.trim()) {
      setEmailError('Please enter your registered email.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.')
      return
    }

    const success = await onRequestOtp(email)
    if (success) {
      setStep(2)
    } else {
      setEmailError('Failed to send OTP. Try again.')
    }
  }

  // ------------------ STEP 2: VERIFY OTP ------------------
  const handleVerifyOtp = async () => {
    setOtpError('')

    if (!otp.trim()) {
      setOtpError('Please enter the OTP.')
      return
    }

    const success = await onVerifyOtp(email, otp)

    if (success) {
      setStep(3)
    } else {
      setOtpError('Invalid OTP. Please try again.')
    }
  }

  // ------------------ STEP 3: UPDATE PASSWORD ------------------
  const handlePasswordUpdate = async () => {
    setPasswordError('')
    setConfirmPasswordError('')

    if (!password) {
      setPasswordError('Please enter a new password.')
      return
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password.')
      return
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.')
      return
    }

    const success = await onUpdatePassword(email, password)

    if (success) {
      // Clear temp storage after success
      sessionStorage.removeItem('reset_step')
      sessionStorage.removeItem('reset_email')
      sessionStorage.removeItem('reset_otp')

      alert('Password updated successfully!')
    } else {
      setConfirmPasswordError('Failed to update password.')
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center align-content-center">
      <div
      style={{
        width: '420px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
        padding: '20px',
        background: 'white',
      }}
      >
        <div className="text-center mb-3">
          <img src={DermaCareLogo} alt="Logo" style={{ width: '100px', marginBottom: '10px' }} />
          <h4 style={{ fontWeight: '600', color: '#333' }}>Reset Your Password</h4>
        </div>

        <CCardBody>
          {/* ---------------- STEP 1: Email ---------------- */}
          {step === 1 && (
            <>
              <CFormLabel>Email Address</CFormLabel>
              <CFormInput
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
              />
              {emailError && <p className="text-danger mt-1">{emailError}</p>}

              <CButton
                color="primary"
                className="w-100 mt-3"
                style={{ borderRadius: '8px' }}
                onClick={handleSendOtp}
              >
                Get OTP
              </CButton>
            </>
          )}

          {/* ---------------- STEP 2: OTP ---------------- */}
          {step === 2 && (
            <>
              <CFormLabel>Enter OTP</CFormLabel>
              <CFormInput
                type="number"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value)
                  setOtpError('')
                }}
              />
              {otpError && <p className="text-danger mt-1">{otpError}</p>}

              <CButton
                color="primary"
                className="w-100 mt-3"
                style={{ borderRadius: '8px' }}
                onClick={handleVerifyOtp}
              >
                Verify OTP
              </CButton>

              <CButton
                color="secondary"
                className="w-100 mt-2"
                style={{ borderRadius: '8px' }}
                onClick={handleSendOtp}
              >
                Resend OTP
              </CButton>
            </>
          )}

          {/* ---------------- STEP 3: PASSWORD RESET ---------------- */}
          {step === 3 && (
            <>
              <div className="mb-3">
                <CFormLabel>New Password</CFormLabel>
                <CFormInput
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError('')
                  }}
                />
                {passwordError && <p className="text-danger mt-1">{passwordError}</p>}
              </div>

              <div className="mb-3">
                <CFormLabel>Confirm Password</CFormLabel>
                <CFormInput
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setConfirmPasswordError('')
                  }}
                />
                {confirmPasswordError && <p className="text-danger mt-1">{confirmPasswordError}</p>}
              </div>

              <CButton
                color="primary"
                className="w-100 mt-2"
                style={{ borderRadius: '8px' }}
                onClick={handlePasswordUpdate}
              >
                Update Password
              </CButton>
            </>
          )}

          {/* Back to Login */}
          <div className="text-center mt-3">
            <a href="/login" style={{ fontSize: '14px', color: '#ff4f9a' }}>
              Back to Login
            </a>
          </div>
        </CCardBody>
      </div>
    </div>
  )
}
