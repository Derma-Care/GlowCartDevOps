import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilLockUnlocked, cilShieldAlt } from '@coreui/icons'
import axios from 'axios'

import { useHospital } from '../../Usecontext/HospitalContext'
import ResetPassword from '../../../views/Resetpassword'
import { http, httpPublic } from '../../../Utils/Interceptors'
import DermaLogo from '../../../assets/images/logoP.png' // adjust path if needed
import { COLORS, NGK_COLORS } from '../../../Constant/Themes'
import { toast, ToastContainer } from 'react-toastify'
import { showCustomToast } from '../../../Utils/Toaster'
import { emailPattern } from '../../../Constant/Constants'
import ResetPasswordScreen from '../../Payouts/ResetPasswordForm'
import ForgotPasswordPage from './ForgotPasswordPage'
import ForgotPasswordModal from './ForgotPasswordPage'
import { MainAdmin_URL, updatePassword } from '../../../baseUrl'

const Login = () => {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uloading, setULoading] = useState(false)

  // const { fetchHospitalDetails,selectedHospital } = useHospital()
  const [forgotModal, setForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')

  const { selectedHospital, setUser, setHospitalId, setSelectedHospital, fetchAllData } =
    useHospital()
  const navigate = useNavigate()
  const resetRef = useRef()

  const validateForm = () => {
    const errors = {}
    if (!userName.trim()) errors.userName = 'Username is required'
    if (!password.trim()) errors.password = 'Password is required'
    if (password && password.length < 6) errors.password = 'Password must be at least 6 characters'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  useEffect(() => {
    // ✅ Clear storage when login page loads
    localStorage.clear()
  }, [])

  const handleClinicLogin = async (e) => {
    if (e?.preventDefault) e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrorMessage('')

    try {
      // 🔥 API CALL
      const response = await http.post(
        `/login`,
        { username: userName, password },
        { headers: { 'Content-Type': 'application/json' } },
      )

      console.log('Login response:', response.data)

      if (!response.data?.success) {
        showCustomToast(response.data?.message || 'Login failed', 'error')
        return
      }

      const data = response.data.data

      // 🛑 Reject if clinic not VERIFIED
      if (data.status !== 'VERIFIED') {
        showCustomToast('Clinic is not verified. Please contact support.', 'error')
        return
      }

      // 🎯 Extract Required Data
      const clinicId = data.clinicId
      const clinicName = data.name
      const permissions = data.permissions || {}

      // 🧠 Store Required Data Only
      localStorage.setItem('HospitalId', clinicId)
      localStorage.setItem('permissions', JSON.stringify(permissions))
      localStorage.setItem('HospitalName', clinicName)
      // localStorage.setItem('permissions', JSON.stringify(permissions))

      // 🔥 Store user in context
      setUser({
        name: clinicName,
        role: 'clinic',
        permissions,
      })

      const hospitalContextData = {
        hospitalId: clinicId,
        hospitalName: clinicName,
        data: data,
      }

      // 🔥 Store selected clinic in context
      setSelectedHospital(hospitalContextData)

      showCustomToast(`${data.message || 'Login successful!'}`, 'success')

      // Redirect
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)

      const msg = err?.response?.data?.message

      if (msg) {
        showCustomToast(msg, 'error')
        setErrorMessage(msg)
      } else {
        const generic = 'Unexpected error occurred. Please try again.'
        showCustomToast(generic, 'error')
        setErrorMessage(generic)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    // 1️⃣ Validate child form
    const isValid = resetRef.current?.validateForm()
    if (!isValid) return

    // 2️⃣ Get form data
    const form = resetRef.current?.getFormData()

    setULoading(true)

    try {
      const response = await axios.put(`${MainAdmin_URL}/${updatePassword}/${form.username}`, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      })

      if (response.data.success) {
        showCustomToast(`${response.data.message}` || 'Password updated successfully!', 'success')
        setShowResetModal(false)
      } else {
        showCustomToast(response.data.message, 'error')
      }
    } catch (err) {
      console.log(err)
      showCustomToast(`${err.response.data.message}` || 'Error updating password.', 'error')
    } finally {
      setULoading(false)
    }
  }

  return (
    // Outer container uses flex column and full viewport height to allow sticky footer without overflow
    <>
      <ToastContainer />
      <div className="d-flex flex-column min-vh-100 derma-bg">
        {/* Main content - will grow and keep footer at bottom */}
        <div className="flex-grow-1 d-flex justify-content-center align-content-center align-items-center ">
          <CContainer fluid className="p-0 h-100   align-content-center align-items-center">
            {/* Use h-100 on the row so it occupies the available height (minus footer) */}
            <CRow className="g-0 h-100">
              {/* LEFT: Brand / Hero */}
              <CCol
                md={6}
                className="d-none d-md-flex flex-column justify-content-center   px-5 py-4"
              >
                <div />
                <div className="hero-highlight text-center px-3">
                  <img
                    src={DermaLogo}
                    alt="Derma Care"
                    className="mb-4"
                    style={{ width: 120, height: 'auto' }}
                  />
                  <h2 className="fw-bold mb-3" style={{ color: NGK_COLORS.primary }}>
                    Welcome to Neeha's GlowKart
                  </h2>
                  <p className="lead mb-4" style={{ opacity: 0.95, color: NGK_COLORS.textDark }}>
                    Manage dermatology operations seamlessly — appointments, procedures, dates,
                    offers & more.
                  </p>
                </div>
              </CCol>

              {/* RIGHT: Card + Tabs + Form */}
              <CCol md={6} className="d-flex align-items-center justify-content-center md-5 ">
                <CCard
                  className="shadow-lg border-1 derma-hero w-100 "
                  style={{ maxWidth: 460, borderColor: NGK_COLORS.primary }}
                >
                  <CCardBody className="p-4 p-md-5 ">
                    <h3 className="text-center fw-bold mb-5" style={{ color: NGK_COLORS.primary }}>
                      NGK Login
                    </h3>

                    {/* Error message */}
                    {errorMessage && (
                      <div className="alert alert-danger text-center py-2 mb-3">{errorMessage}</div>
                    )}

                    {/* CLINIC TAB */}

                    <CForm onSubmit={handleClinicLogin} noValidate>
                      {/* Username */}
                      <CInputGroup>
                        <CInputGroupText style={{ backgroundColor: NGK_COLORS.primary }}>
                          <CIcon
                            icon={cilUser}
                            style={{
                              cursor: 'pointer',
                              color: 'white',
                            }}
                          />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Username"
                          value={userName}
                          style={{
                            cursor: 'pointer',
                            borderColor: NGK_COLORS.borderSoft,
                          }}
                          onChange={(e) => {
                            setUserName(e.target.value)
                            if (fieldErrors.userName)
                              setFieldErrors((p) => ({ ...p, userName: '' }))
                          }}
                          aria-invalid={!!fieldErrors.userName}
                          autoComplete="username"
                        />
                      </CInputGroup>
                      {fieldErrors.userName && (
                        <small className="text-danger">{fieldErrors.userName}</small>
                      )}

                      {/* Password */}
                      <CInputGroup className="mt-3 ">
                        <CInputGroupText
                          onClick={() => setShowPassword((s) => !s)}
                          style={{ cursor: 'pointer', backgroundColor: NGK_COLORS.primary }}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          <CIcon
                            icon={showPassword ? cilLockUnlocked : cilLockLocked}
                            style={{ color: 'white' }}
                          />
                        </CInputGroupText>
                        <CFormInput
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          value={password}
                          style={{
                            cursor: 'pointer',
                            borderColor: NGK_COLORS.borderSoft,
                          }}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            if (fieldErrors.password)
                              setFieldErrors((p) => ({ ...p, password: '' }))
                          }}
                          aria-invalid={!!fieldErrors.password}
                          autoComplete="current-password"
                        />
                      </CInputGroup>
                      {fieldErrors.password && (
                        <small className="text-danger">{fieldErrors.password}</small>
                      )}

                      {/* <div
                        className="d-flex justify-content-between mt-2"
                        style={{ color: NGK_COLORS.primary }}
                      >
                        <a
                          style={{ color: NGK_COLORS.primary }}
                          href="#"
                          className="text-decoration-none derma-link"
                          onClick={(e) => {
                            e.preventDefault()
                            setShowResetModal(true)
                          }}
                        >
                          Forgot password?
                        </a>
                      </div> */}
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

                      <CButton
                        type="submit"
                        disabled={isLoading}
                        className="w-100 mt-4 derma-btn"
                        style={{ backgroundColor: NGK_COLORS.primarySoft, color: 'white' }}
                      >
                        {isLoading ? <CSpinner size="sm" /> : 'Login'}
                      </CButton>
                    </CForm>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CContainer>
        </div>

        {/* Sticky Footer */}
        <footer
          className="d-flex justify-content-around small py-2 opacity-75 mt-auto"
          style={{ color: NGK_COLORS.primary, backgroundColor: '#f8f9fa' }}
        >
          <span
            className="d-inline-flex align-items-center gap-2"
            style={{ color: NGK_COLORS.primary }}
          >
            <CIcon icon={cilShieldAlt} /> Secure by design
          </span>
          <span style={{ color: NGK_COLORS.primary }}>
            © {new Date().getFullYear()} Uditcosmetech Private Limited
          </span>
          <a
            href="https://uditcosmetech.com/"
            target="_blank"
            style={{ color: NGK_COLORS.primary }}
          >
            About Uditcosmetech Private Limited
          </a>
        </footer>

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
              <ForgotPasswordModal forgotModal={forgotModal} setForgotModal={setForgotModal} />
            </div>
          </CModalBody>
        </CModal>

        {/* Reset Modal */}
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
              setLoading={setULoading}
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
              disabled={uloading}
              style={{ backgroundColor: NGK_COLORS.primary, border: 'none' }}
              onClick={handleUpdatePassword}
            >
              {uloading ? 'Updating...' : 'Update Password'}
            </CButton>
          </CModalFooter>
        </CModal>
      </div>
    </>
  )
}

export default Login
