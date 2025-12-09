import React, { useState, useEffect, useRef } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
} from '@coreui/react'
import sendPayoutLockEmail from '../../Utils/sendPayoutLockEmail'
import { useHospital } from '../Usecontext/HospitalContext'
import ResetPassword from '../Resetpassword'
import { NGK_COLORS } from '../../Constant/Themes'
import { showCustomToast } from '../../Utils/Toaster'
import { Link } from 'react-router-dom'
import { http } from '../../Utils/Interceptors'

export default function PayoutAuthModal({ visible, onClose, onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const resetRef = useRef()
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(false)
  const [ploading, setPLoading] = useState(false)

  const { selectedHospital } = useHospital()

  const dummyUser = {
    username: 'admin',
    password: '1234',
  }

  // CHECK LOCK STATUS FROM LOCAL STORAGE
  useEffect(() => {
    const lockTime = localStorage.getItem('payout_lock_time')

    if (lockTime) {
      const now = Date.now()

      if (now - Number(lockTime) < 60 * 60 * 1000) {
        setAttempts(3)
        setGeneralError(
          'Too many failed attempts. Please contact Clinic Management or wait 1 hour.',
        )
      } else {
        localStorage.removeItem('payout_lock_time')
      }
    }
  }, [visible])

  // RESET FORM WHEN MODAL CLOSES
  useEffect(() => {
    if (!visible) {
      setUsername('')
      setPassword('')
      setUsernameError('')
      setPasswordError('')
      setGeneralError('')
      setAttempts(0)
      setLoading(false)
    }
  }, [visible])

  const handleLogin = () => {
    setUsernameError('')
    setPasswordError('')
    setGeneralError('')

    if (!username.trim()) setUsernameError('Username is required')
    if (!password.trim()) setPasswordError('Password is required')
    if (!username.trim() || !password.trim()) return

    if (attempts >= 3) {
      setGeneralError('Too many failed attempts. Please contact Clinic Management or wait 1 hour.')
      return
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)

      // SUCCESS LOGIN
      if (username === dummyUser.username && password === dummyUser.password) {
        onSuccess()
        return
      }

      // FAILED LOGIN
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= 3) {
        // STORE LOCK TIME
        localStorage.setItem('payout_lock_time', Date.now().toString())

        // SEND EMAIL TO MANAGEMENT
        sendPayoutLockEmail({ username, email: selectedHospital?.data.email })

        setGeneralError(
          `Too many failed attempts. Please contact Clinic Management or wait 1 hour. ${selectedHospital?.data.email}`,
        )
      } else {
        setGeneralError('Invalid username or password')
      }
    }, 2000)
  }

  const loginDisabled = attempts >= 3 || loading

  const handleUpdatePassword = async () => {
    // 1️⃣ Validate child form
    const isValid = resetRef.current?.validateForm()
    if (!isValid) return

    // 2️⃣ Get form data
    const form = resetRef.current?.getFormData()

    setPLoading(true)

    try {
      const response = await http.put(`/updatePassword/${form.username}`, {
        password: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      })

      if (response.data.success) {
        showCustomToast('Password updated successfully!', 'success')
        setShowResetModal(false)
      } else {
        showCustomToast(response.data.message, 'error')
      }
    } catch (err) {
      showCustomToast(err?.data?.message || 'Error updating password.', 'error')
      showCustomToast('Error updating password.', 'error')
    } finally {
      setPLoading(false)
    }
  }

  return (
    <CModal visible={visible} alignment="center" backdrop="static">
      <CModalHeader closeButton={false}>
        <CModalTitle>Payout Authentication</CModalTitle>

        {/* Custom Close Button */}
        <div
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            width: '28px',
            height: '28px',
            background: 'var(--color-black)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          ✕
        </div>
      </CModalHeader>

      <CModalBody>
        <p>Please enter credentials to access Payouts.</p>

        {/* USERNAME */}
        <CFormInput
          className="mb-1"
          placeholder="Username"
          value={username}
          disabled={loginDisabled}
          onChange={(e) => {
            setUsername(e.target.value)
            setUsernameError('')
            setGeneralError('')
          }}
        />
        {usernameError && <small style={{ color: 'red' }}>{usernameError}</small>}

        {/* PASSWORD */}
        <CFormInput
          className="mt-3 mb-1"
          type="password"
          placeholder="Password"
          value={password}
          disabled={loginDisabled}
          onChange={(e) => {
            setPassword(e.target.value)
            setPasswordError('')
            setGeneralError('')
          }}
        />
        {passwordError && <small style={{ color: 'red' }}>{passwordError}</small>}

        {/* FORGOT PASSWORD */}
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center ">
            {/* Left: Forgot Password */}
            <Link
              to="/resetPassword"
              style={{
                cursor: 'pointer',
                color: 'var(--color-black)',
                textDecoration: 'underline',
                fontSize: '14px',
              }}
              onClick={() => {
                onClose()
                setGeneralError(
                  'We have sent a password reset link to your registered email. Please check your inbox.',
                  'info',
                )
              }}
            >
              Forgot Password?
            </Link>

            {/* Right: Change Password */}
            <a
              href="#"
              className="text-decoration-none mb-0"
              style={{
                color: NGK_COLORS.primary,
                fontSize: '14px',
              }}
              onClick={(e) => {
                e.preventDefault()
                setShowResetModal(true)
              }}
            >
              Change Password?
            </a>
          </div>
        </div>

        <CModal
          visible={showResetModal}
          size="lg"
          onClose={() => setShowResetModal(false)}
          backdrop="static"
          className="custom-modal"
        >
          <CModalHeader>
            <CModalTitle style={{ color: NGK_COLORS.primary }}>Change Password</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <ResetPassword
              onClose={() => setShowResetModal(false)}
              setLoading={setPLoading}
              ref={resetRef}
            />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowResetModal(false)}>
              Close
            </CButton>
            <CButton
              type="submit"
              color="primary"
              disabled={ploading}
              style={{ backgroundColor: NGK_COLORS.primary, border: 'none' }}
              onClick={handleUpdatePassword}
            >
              {ploading ? 'Updating...' : 'Update Password'}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* GENERAL ERROR */}
        {generalError && <p style={{ color: 'red' }}>{generalError}</p>}
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>

        <CButton
          style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
          disabled={loginDisabled}
          onClick={handleLogin}
        >
          {loading ? 'Authenticating...' : attempts >= 3 ? 'Locked' : 'Authenticate'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
