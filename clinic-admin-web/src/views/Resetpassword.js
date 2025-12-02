import React, { useState } from 'react'
import axios from 'axios'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import {
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CButton,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { BASE_URL } from '../baseUrl'
import { http } from '../Utils/Interceptors'
import { NGK_COLORS } from '../Constant/Themes'

const ResetPassword = ({ onClose, setLoading }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    username: '',
  })

  const [message, setMessage] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validatePassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { currentPassword, newPassword, confirmPassword } = form

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('All fields are required.')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('New and confirm password do not match.')
      return
    }

    if (!validatePassword(newPassword)) {
      setMessage(
        'Password must be 8–20 characters, with at least one uppercase letter, one number, and one special character.',
      )
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await http.put(`/updatePassword/${form.username}`, {
        password: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      })

      if (response.data.success) {
        setMessage('✅ Password updated successfully!')
        setForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setTimeout(() => {
          onClose?.() // ✅ Close modal if onClose is passed
        }, 1000)
      } else {
        setMessage(response.data.message || '❌ Failed to update password.')
      }
    } catch (err) {
      console.error('Password update error:', err)
      setMessage('❌ Error updating password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-2">
      <div>
        <div>
          {/* <h4 className="mb-3">🔐 Change Password</h4> */}
          <CForm onSubmit={handleSubmit}>
            <div className="mb-3">
              <CFormLabel>User Name</CFormLabel>
              <CInputGroup>
                <CFormInput
                  type="text"
                  name="username"
                  placeholder="Enter User Name"
                  // style={{
                  //   cursor: 'pointer',
                  //   borderColor: NGK_COLORS.borderSoft,

                  // }}
                  value={form.username}
                  onChange={handleChange}
                />
                <CInputGroupText
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{ cursor: 'pointer' }}
                >
                  {showCurrent ? <FaEyeSlash /> : <FaEye />}
                </CInputGroupText>
              </CInputGroup>
            </div>
            {/* Current Password */}
            <div className="mb-3">
              <CFormLabel>Current Password</CFormLabel>
              <CInputGroup>
                <CFormInput
                  placeholder="ENter Current Password"
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                />
                <CInputGroupText
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{ cursor: 'pointer' }}
                >
                  {showCurrent ? <FaEyeSlash /> : <FaEye />}
                </CInputGroupText>
              </CInputGroup>
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
                  placeholder="8–20 chars, 1 capital, 1 special, 1 number"
                />
                <CInputGroupText onClick={() => setShowNew(!showNew)} style={{ cursor: 'pointer' }}>
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </CInputGroupText>
              </CInputGroup>
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <CFormLabel>Confirm New Password</CFormLabel>
              <CInputGroup>
                <CFormInput
                  placeholder="ENter Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <CInputGroupText
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ cursor: 'pointer' }}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </CInputGroupText>
              </CInputGroup>
            </div>

            {/* Message */}
            {message && <div className="mb-3 text-danger fw-bold">{message}</div>}

            {/* Submit */}
          </CForm>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
