import React, { useImperativeHandle, useState, forwardRef } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { CForm, CFormInput, CFormLabel, CInputGroup, CInputGroupText } from '@coreui/react'
import { http } from '../Utils/Interceptors'
import { passwordRegex } from '../Constant/Constants'

const ResetPassword = forwardRef(({ onClose, setLoading }, ref) => {
  const [form, setForm] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // ⭐ Individual errors
  const [errors, setErrors] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({ ...prev, [name]: value }))

    // Clear error while typing
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validatePassword = (password) => {
    return passwordRegex.test(password)
  }

  // ------------------------------------------------------
  //    VALIDATION + API SUBMIT
  // ------------------------------------------------------
  const handleValidation = () => {
    let newErrors = {
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    if (!form.username) newErrors.username = 'Username is required.'
    if (!form.currentPassword) newErrors.currentPassword = 'Current password is required.'
    if (!form.newPassword) newErrors.newPassword = 'New password is required.'
    if (!form.confirmPassword) newErrors.confirmPassword = 'Confirm password is required.'

    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    if (form.newPassword && !validatePassword(form.newPassword)) {
      newErrors.newPassword =
        'Password must be 8–20 chars, include uppercase, number, and special character.'
    }

    setErrors(newErrors)

    // Return TRUE if valid
    return Object.values(newErrors).every((msg) => msg === '')
  }

  // Expose handleSubmit to modal button
  useImperativeHandle(ref, () => ({
    validateForm: handleValidation,
    getFormData: () => form,
  }))

  return (
    <div className="container mt-2">
      <CForm>
        {/* Username */}
        <div className="mb-3">
          <CFormLabel>User Name</CFormLabel>
          <CInputGroup>
            <CFormInput
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
            />
          </CInputGroup>
          {errors.username && <p className="text-danger">{errors.username}</p>}
        </div>

        {/* Current Password */}
        <div className="mb-3">
          <CFormLabel>Current Password</CFormLabel>
          <CInputGroup>
            <CFormInput
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
            />
            <CInputGroupText onClick={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? <FaEyeSlash /> : <FaEye />}
            </CInputGroupText>
          </CInputGroup>
          {errors.currentPassword && <p className="text-danger">{errors.currentPassword}</p>}
        </div>

        {/* New Password */}
        <div className="mb-3">
          <CFormLabel>New Password</CFormLabel>
          <CInputGroup>
            <CFormInput
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
            />
            <CInputGroupText onClick={() => setShowNew(!showNew)}>
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </CInputGroupText>
          </CInputGroup>
          {errors.newPassword && <p className="text-danger">{errors.newPassword}</p>}
        </div>

        {/* Confirm Password */}
        <div className="mb-3">
          <CFormLabel>Confirm Password</CFormLabel>
          <CInputGroup>
            <CFormInput
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
            />
            <CInputGroupText onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </CInputGroupText>
          </CInputGroup>
          {errors.confirmPassword && <p className="text-danger">{errors.confirmPassword}</p>}
        </div>
      </CForm>
    </div>
  )
})

export default ResetPassword
