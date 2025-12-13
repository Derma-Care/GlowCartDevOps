import React, { useState, useRef } from 'react'
import { CFormLabel, CFormInput, CButton } from '@coreui/react'
import axios from 'axios'
import { NGK_COLORS } from '../../../Constant/Themes'
import { emailPattern, passwordRegex } from '../../../Constant/Constants'
import { showCustomToast } from '../../../Utils/Toaster'
import DermaCareLogo from '../../../assets/images/logoP.png'
import {
  BASE_URL,
  MainAdmin_URL,
  resendOTP,
  resendPayoutOTP,
  resetPassword,
  resetPayoutPassword,
  sendOtp,
  sendPayoutOtp,
} from '../../../baseUrl'

export default function ForgotPasswordPayoutContent({ onClose, setForgotModal }) {
  const [step, setStep] = useState(1)

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const otpRefs = useRef([])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [lodaing, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [update, setupdate] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const timerRef = useRef(null)

  // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // -------------------- STEP 1: SEND OTP --------------------
  const handleSendOtp = async () => {
    setEmailError('')
    setResendTimer(600) // 10 minutes
    startTimer()

    if (!email.trim()) {
      setEmailError('Email is required')
      return
    }

    if (!emailPattern.test(email)) {
      setEmailError('Enter a valid email')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${BASE_URL}/${sendPayoutOtp}`, {
        identifier: email,
      })

      console.log(res)

      if (res.data.success) {
        showCustomToast(`${res.data.message}` || 'OTP sent successfully!', 'success')
        setResendTimer(600) // start 10 min countdown
        startTimer()
        setStep(2)
      } else {
        showCustomToast(`${res.data.message || 'Failed to send OTP'}`, 'error')
        setEmailError('Failed to send OTP')
      }
    } catch (err) {
      console.log(err.response.data.message)
      showCustomToast(`${err.response.data.message || 'Failed to send OTP'}`, 'error')
      setEmailError(`${err.response.data.message || 'Failed to send OTP'}`)
    } finally {
      setLoading(false)
    }
  }

  // -------------------- STEP 2: VERIFY OTP --------------------
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return

    const updated = [...otp]
    updated[index] = value
    setOtp(updated)

    // Move cursor
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
    if (!value && index > 0) otpRefs.current[index - 1]?.focus()

    // ⭐ USE updated array (not state) to check OTP completeness
    const otpValue = updated.join('')

    if (otpValue.length === 6 && !updated.includes('') && !verifying) {
      // Delay slightly so state updates before verify runs
      setTimeout(() => handleVerifyOtp(otpValue), 150)
    }
  }

  const handleVerifyOtp = async (autoOtp) => {
    const otpValue = autoOtp || otp.join('')

    if (otpValue.length < 6) {
      setOtpError('Enter all 6 digits')
      return
    }
    setStep(3)
    // setVerifying(true) // start loading

    // try {
    //   const res = await axios.post(`${MainAdmin_URL}/clinics/reset-password`, {
    //     identifier: email,
    //     otp: otpValue,
    //     newPassword: 'temp-pass',
    //   })

    //   if (!res.data.success) {
    //     setOtpError(res.data.message || 'Invalid OTP')
    //     return
    //   }

    //   showCustomToast('OTP Verified!', 'success')
    //   setStep(3)
    // } catch (err) {
    //   setOtpError(err?.response?.data?.message || 'Invalid OTP')
    // } finally {
    //   setVerifying(false) // stop loading
    // }
  }

  const resendOtp = async () => {
    // ❗ If email is missing
    if (!email.trim()) {
      setOtpError('Email is required to resend OTP')
      showCustomToast('Email is required to resend OTP', 'error')
      return // stop function
    }

    setResending(true)
    setOtp(['', '', '', '', '', ''])
    otpRefs.current[0]?.focus()

    try {
      const res = await axios.post(`${BASE_URL}/${resendPayoutOTP}`, {
        identifier: email,
      })

      showCustomToast(res.data.message || 'OTP resent successfully!', 'success')
    } catch (err) {
      setOtpError(err?.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  // -------------------- STEP 3: UPDATE PASSWORD --------------------
  const handleUpdatePassword = async () => {
    setPasswordError('')
    setConfirmPasswordError('')

    if (!password.trim()) {
      setPasswordError('Please enter a new password')
      return
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password')
      return
    }

    if (!passwordRegex.test(password)) {
      setPasswordError('8–20 chars, include uppercase, lowercase, number & special character')
      return
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }
    setupdate(true)
    try {
      const res = await axios.post(`${BASE_URL}/${resetPayoutPassword}`, {
        identifier: email,
        otp: otp.join(''),
        newPassword: password,
      })

      // If success from backend
      if (res?.data?.success) {
        // Close modal
        onClose?.()
        setForgotModal(false)
        handleSuccess(res.data.message)
        return
      }

      setConfirmPasswordError(res.data.message || 'Failed to update password')
    } catch (err) {
      console.log('AXIOS ERROR:', err)

      // ⭐ BACKEND RETURNS SUCCESS BUT AXIOS TREATS IT AS ERROR
      if (!err.response) {
        handleSuccess('Password reset successfully')
        onClose?.()
        setForgotModal(false)
        return
      }

      setConfirmPasswordError(err.response?.data?.message || 'Error updating password')
    } finally {
      setupdate(false)
    }
  }

  // Shared success function
  const handleSuccess = (msg) => {
    showCustomToast(msg, 'success')
  }

  // -------------------- UI --------------------
  return (
    <div style={{ textAlign: 'center', padding: '10px 5px' }}>
      <img
        src={DermaCareLogo}
        alt="logo"
        style={{
          height: 100,
          borderRadius: 12,
          objectFit: 'fill',
          marginBottom: '20px',
          // border: '1px solid #eee',
        }}
      />
      {/* ---------- STEP 1: EMAIL ---------- */}
      {step === 1 && (
        <>
          <h4 style={{ color: NGK_COLORS.primary }}>Reset Your Password</h4>

          <CFormLabel className="mt-3">Enter You'r Registered Email</CFormLabel>
          <CFormInput
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError('')
            }}
            style={{ borderRadius: 8 }}
          />

          {emailError && <small className="text-danger">{emailError}</small>}

          <CButton
            disabled={lodaing}
            className="w-100 mt-3 derma-btn"
            onClick={handleSendOtp}
            style={{ backgroundColor: NGK_COLORS.primarySoft, color: 'white' }}
          >
            {lodaing ? 'Sending...' : 'Send OTP'}
          </CButton>

          <p
            className="mt-3"
            style={{ color: NGK_COLORS.primary, cursor: 'pointer' }}
            onClick={() => setStep(2)}
          >
            OTP Screen →
          </p>
        </>
      )}

      {/* ---------- STEP 2: OTP ---------- */}
      {step === 2 && (
        <>
          <h4 style={{ color: NGK_COLORS.primary }}>Enter OTP</h4>

          {/* ----------- Animated OTP Input ----------- */}
          <div
            className={`d-flex justify-content-between mt-3 ${otpError ? 'otp-error-shake' : ''}`}
            style={{ gap: '8px' }}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                maxLength={1}
                className="otp-box"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, i)}
                onFocus={(e) => e.target.select()}
                style={{
                  width: '48px',
                  height: '55px',
                  fontSize: '22px',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: `2px solid ${NGK_COLORS.primary}`, // ⭐ NGK PRIMARY BORDER
                  outline: 'none',
                }}
              />
            ))}
          </div>

          {otpError && <small className="text-danger">{otpError}</small>}
          <div className="d-flex justify-content-between mt-4" style={{ gap: '10px' }}>
            {/* RESEND OTP BUTTON - LEFT */}
            <CButton
              disabled={resending || verifying || resendTimer > 0}
              color="secondary"
              className="flex-grow-1"
              style={{ borderRadius: 8 }}
              onClick={resendOtp}
            >
              {resendTimer > 0
                ? `Resend in ${String(Math.floor(resendTimer / 60)).padStart(2, '0')}:${String(
                    resendTimer % 60,
                  ).padStart(2, '0')}`
                : resending
                  ? 'Sending...'
                  : 'Resend OTP'}
            </CButton>

            {/* VERIFY OTP BUTTON - RIGHT */}
            <CButton
              disabled={verifying || resending}
              className="flex-grow-1"
              style={{
                background: NGK_COLORS.primary,
                color: 'white',
                borderRadius: 8,
              }}
              onClick={handleVerifyOtp}
            >
              Next
            </CButton>
          </div>

          <p
            className="mt-4 mb-3"
            style={{ color: NGK_COLORS.primary, cursor: 'pointer' }}
            onClick={() => setStep(1)}
          >
            ← Back to Email
          </p>
        </>
      )}

      {/* ---------- STEP 3: RESET PASSWORD ---------- */}
      {step === 3 && (
        <div style={{ textAlign: 'center' }}>
          {/* BACK TO STEP 2 */}
          <p
            className="  mb-3"
            style={{ color: NGK_COLORS.primary, cursor: 'pointer' }}
            onClick={() => setStep(2)}
          >
            ← Back to OTP
          </p>

          <h4 style={{ color: NGK_COLORS.primary, fontWeight: 600, marginBottom: 20 }}>
            Set New Password
          </h4>

          {/* NEW PASSWORD */}
          <div className="text-start mb-3">
            <CFormLabel style={{ fontWeight: 500 }}>New Password</CFormLabel>

            <div className="position-relative">
              <CFormInput
                type={showPass ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                style={{ borderRadius: 8, paddingRight: 40 }}
              />

              <i
                className={`ri-${showPass ? 'eye-off-line' : 'eye-line'}`}
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 22,
                  cursor: 'pointer',
                  color: '#777',
                }}
              />
            </div>

            {passwordError && <small className="text-danger">{passwordError}</small>}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="text-start mb-3">
            <CFormLabel style={{ fontWeight: 500 }}>Confirm Password</CFormLabel>

            <div className="position-relative">
              <CFormInput
                type={showConfirmPass ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setConfirmPasswordError('')
                }}
                style={{ borderRadius: 8, paddingRight: 40 }}
              />

              <i
                className={`ri-${showConfirmPass ? 'eye-off-line' : 'eye-line'}`}
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 22,
                  cursor: 'pointer',
                  color: '#777',
                }}
              />
            </div>

            {confirmPasswordError && <small className="text-danger">{confirmPasswordError}</small>}
          </div>

          {/* BUTTON */}
          <CButton
            className="w-100 mt-3"
            style={{
              background: NGK_COLORS.primary,
              color: 'white',
              padding: '10px',
              borderRadius: 8,
            }}
            onClick={handleUpdatePassword}
          >
            {update ? 'Updating...' : 'Update Password'}
          </CButton>
        </div>
      )}
    </div>
  )
}
