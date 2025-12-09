import React, { useState } from 'react'
import { CCard, CCardBody, CButton, CFormInput, CFormLabel } from '@coreui/react'
import DermaCareLogo from '../../assets/images/logoP.png'
import { clinicId } from '../../Constant/Constants'

const ResetPasswordScreen = ({ onSubmit }) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // ⭐ Individual error states
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  const handleSubmit = () => {
    let valid = true

    // Reset errors
    setPasswordError('')
    setConfirmPasswordError('')

    // ❌ Validate Password
    if (!password) {
      setPasswordError('Please enter your new password.')
      valid = false
    }

    // ❌ Validate Confirm Password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.')
      valid = false
    }

    // ❌ Match validation
    if (password && confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.')
      valid = false
    }

    // STOP if not valid
    if (!valid) return

    // Call API
    onSubmit(password)
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #ffe5f0, #fff8fc)',
      }}
    >
      <CCard
        style={{
          width: '420px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
          padding: '20px',
          background: 'white',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-3">
          <img
            src={DermaCareLogo}
            alt="NGK Logo"
            style={{ width: '100px', marginBottom: '10px' }}
          />
          <h4 style={{ fontWeight: '600', color: '#333' }}>Reset Your Password</h4>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Please enter your new password below.
          </p>
        </div>

        <CCardBody>
          {/* New Password */}
          <div className="mb-3">
            <CFormLabel style={{ fontWeight: '500' }}>New Password</CFormLabel>
            <CFormInput
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError('')
              }}
              style={{
                borderRadius: '8px',
                borderColor: '#ff7fbf',
              }}
            />
            {/* Error */}
            {passwordError && (
              <p className="text-danger mt-1" style={{ fontSize: '13px' }}>
                {passwordError}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <CFormLabel style={{ fontWeight: '500' }}>Confirm Password</CFormLabel>
            <CFormInput
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setConfirmPasswordError('')
              }}
              style={{
                borderRadius: '8px',
                borderColor: '#ff7fbf',
              }}
            />

            {/* Error */}
            {confirmPasswordError && (
              <p className="text-danger mt-1" style={{ fontSize: '13px' }}>
                {confirmPasswordError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <CButton
            color="primary"
            className="w-100 mt-2"
            style={{
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #ff4f9a, #ff7fbf)',
              border: 'none',
              fontWeight: '600',
              padding: '10px',
            }}
            onClick={handleSubmit}
          >
            Update Password
          </CButton>

          {/* Back to Login */}
          <div className="text-center mt-3">
            <a
              href="/login"
              className="text-decoration-none"
              style={{ fontSize: '14px', color: '#ff4f9a' }}
            >
              Back to Login
            </a>
          </div>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ResetPasswordScreen
