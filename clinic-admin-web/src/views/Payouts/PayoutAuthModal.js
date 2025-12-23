import React, { useState, useEffect, useRef } from 'react'

import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import sendPayoutLockEmail from '../../Utils/sendPayoutLockEmail'
import { useHospital } from '../Usecontext/HospitalContext'
import ResetPassword from '../Resetpassword'
import { NGK_COLORS } from '../../Constant/Themes'
import { showCustomToast } from '../../Utils/Toaster'
import { Link } from 'react-router-dom'
import { http } from '../../Utils/Interceptors'
import { payoutlogin, payoutsupdatePassword } from '../../baseUrl'
import ForgotPasswordPayoutContent from '../pages/login/ForgotPayoutPasswordPage'
import CIcon from '@coreui/icons-react'
import { cilEyedropper, cilLockLocked, cilLockUnlocked } from '@coreui/icons'
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
  const [forgotModal, setForgotModal] = useState(false)
  const { selectedHospital } = useHospital()
  const [showPassword, setShowPassword] = useState(false)

  // const dummyUser = {
  //   username: 'admin',
  //   password: '1234',
  // }

  // // CHECK LOCK STATUS FROM LOCAL STORAGE
  // useEffect(() => {
  //   const lockTime = localStorage.getItem('payout_lock_time')

  //   if (lockTime) {
  //     const now = Date.now()

  //     if (now - Number(lockTime) < 60 * 60 * 1000) {
  //       setAttempts(3)
  //       setGeneralError(
  //         'Too many failed attempts. Please contact Clinic Management or wait 1 hour.',
  //       )
  //     } else {
  //       localStorage.removeItem('payout_lock_time')
  //     }
  //   }
  // }, [visible])

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

  // const handleLogin = async () => {
  //   setUsernameError('')
  //   setPasswordError('')
  //   setGeneralError('')

  //   if (!username.trim()) setUsernameError('Username is required')
  //   if (!password.trim()) setPasswordError('Password is required')
  //   if (!username.trim() || !password.trim()) return

  //   if (attempts >= 3) {
  //     setGeneralError('Too many failed attempts. Please contact Clinic Management or wait 1 hour.')
  //     return
  //   }

  //   setLoading(true)

  //   try {
  //     const response = await http.post(`/${payoutlogin}`, {
  //       payoutUsername: username,
  //       payoutPassword: password,
  //     })
  //     console.log('PAYOUT LOGIN RESPONSE:', response)
  //     if (response.data?.success) {
  //       // ✅ SUCCESS
  //       localStorage.removeItem('payout_lock_time')
  //       setAttempts(0)
  //       onSuccess()
  //       return
  //     }

  //     // ❌ FAILED (backend returned success=false)
  //     throw new Error(response.data?.message || 'Invalid credentials')
  //   } catch (err) {
  //     const newAttempts = attempts + 1
  //     setAttempts(newAttempts)

  //     if (newAttempts >= 3) {
  //       // 🔒 LOCK
  //       localStorage.setItem('payout_lock_time', Date.now().toString())

  //       sendPayoutLockEmail({
  //         username,
  //         email: selectedHospital?.data?.email,
  //       })

  //       setGeneralError(
  //         'Too many failed attempts. Please contact Clinic Management or wait 1 hour.',
  //       )
  //     } else {
  //       setGeneralError(err.message || 'Invalid username or password')
  //     }
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleLogin = async () => {
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

    try {
      const response = await http.post(`/${payoutlogin}`, {
        payoutUsername: username,
        payoutPassword: password,
      })

      // ✅ SUCCESS (only for 200)
      if (response.data?.success) {
        localStorage.removeItem('payout_lock_time')
        setAttempts(0)
        onSuccess()
        return
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message || 'Invalid payout username or password'

      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= 3) {
        localStorage.setItem('payout_lock_time', Date.now().toString())

        sendPayoutLockEmail({
          username,
          email: selectedHospital?.data?.email,
        })

        setGeneralError(
          'Too many failed attempts. Please contact Clinic Management or wait 1 hour.',
        )
      } else {
        setGeneralError(backendMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const loginDisabled = attempts >= 3 || loading

  const handleUpdatePassword = async () => {
    const isValid = resetRef.current?.validateForm()
    if (!isValid) return

    const form = resetRef.current?.getFormData()
    setPLoading(true)

    try {
      const response = await http.put(`/${payoutsupdatePassword}/${form.username}`, {
        currentPayoutPassword: form.currentPassword,
        newPayoutPassword: form.newPassword,
        confirmPayoutPassword: form.confirmPassword,
      })

      if (response.data.success) {
        showCustomToast(response.data.message || 'Password updated successfully!', 'success')
        setGeneralError(response.data.message)
        setShowResetModal(false)
      } else {
        setGeneralError(response.data.message)
        showCustomToast(response.data.message, 'error')
      }
    } catch (err) {
      // showCustomToast(err?.response?.data?.message || 'Error updating password', 'error')
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
        <CInputGroup className="mt-3 mb-1">
          <CFormInput
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            disabled={loginDisabled}
            onChange={(e) => {
              setPassword(e.target.value)
              setPasswordError('')
              setGeneralError('')
            }}
          />

          <CInputGroupText
            style={{ cursor: 'pointer' }}
            onClick={() => setShowPassword(!showPassword)}
          >
            <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} />
          </CInputGroupText>
        </CInputGroup>

        {passwordError && <small style={{ color: 'red' }}>{passwordError}</small>}
        {/* GENERAL ERROR */}
        {generalError && <p style={{ color: 'red' }}>{generalError}</p>}

        {/* FORGOT PASSWORD */}
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center ">
            {/* Left: Forgot Password */}

            <div
              style={{
                cursor: 'pointer',
                color: NGK_COLORS.primary,
                textDecoration: 'underline',
                fontSize: '14px',
              }}
              onClick={() => setForgotModal(true)}
            >
              Forgot Password?
            </div>

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
          visible={forgotModal}
          onClose={() => setForgotModal(false)}
          backdrop="static"
          alignment="center"
          className="custom-modal"
        >
          <CModalBody
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '60vh', background: 'linear-gradient(135deg, #ffe6f0, #ffbfd8)' }}
          >
            <div className="w-100" style={{ maxWidth: '400px' }}>
              <p onClick={() => setForgotModal(false)} style={{ cursor: 'pointer' }}>
                ❌
              </p>
              <ForgotPasswordPayoutContent
                forgotModal={forgotModal}
                setForgotModal={setForgotModal}
              />
            </div>
          </CModalBody>
        </CModal>

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
              generalError={generalError}
            />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowResetModal(false)}>
              Close
            </CButton>
            <CButton
              type="button"
              color="primary"
              disabled={ploading}
              style={{ backgroundColor: NGK_COLORS.primary, border: 'none' }}
              onClick={handleUpdatePassword}
            >
              {ploading ? 'Updating...' : 'Update Password'}
            </CButton>
          </CModalFooter>
        </CModal>
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
