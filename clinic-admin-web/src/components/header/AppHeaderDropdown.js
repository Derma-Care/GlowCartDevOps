import React, { useState, useRef } from 'react'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CButton,
} from '@coreui/react'
import { cilLockLocked, cilAccountLogout, cilSettings } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
 
import DermaCareLogo from '../../assets/images/logoP.png'
import axios from 'axios'
import { MainAdmin_URL, updatePassword } from '../../baseUrl'
import { showCustomToast } from '../../Utils/Toaster'
import ResetPassword from '../../views/Resetpassword'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()

  // ⭐ Modal States
  const [showResetModal, setShowResetModal] = useState(false)
  const resetRef = useRef(null)
  const [uloading, setULoading] = useState(false)

  // ⭐ Logout
  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    navigate('/login')
  }

  // ⭐ Update Password
  const handleUpdatePassword = async () => {
    const isValid = resetRef.current?.validateForm()
    if (!isValid) return

    const form = resetRef.current?.getFormData()
    setULoading(true)

    try {
      const response = await axios.put(`${MainAdmin_URL}/${updatePassword}/${form.username}`, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      })

      if (response.data.success) {
        showCustomToast(response.data.message || 'Password updated successfully!', 'success')
        setShowResetModal(false)
      } else {
        showCustomToast(response.data.message, 'error')
      }
    } catch (err) {
      console.log(err)
      showCustomToast(err?.response?.data?.message || 'Error updating password.', 'error')
    } finally {
      setULoading(false)
    }
  }

  return (
    <>
      <CDropdown variant="nav-item" style={{cursor:"pointer"}}>
        <CDropdownToggle caret={false}>
          <img src={DermaCareLogo} alt="Logo" style={{ width: '50px' }} />
        </CDropdownToggle>

        <CDropdownMenu placement="bottom-end">
          {/* Settings */}
          <CDropdownItem>
            <CIcon icon={cilSettings} className="me-2" />
            Settings
          </CDropdownItem>

          {/* 🔥 Change Password */}
          <CDropdownItem onClick={() => setShowResetModal(true)}>
            <CIcon icon={cilLockLocked} className="me-2" />
            Change Password
          </CDropdownItem>

          {/* Logout */}
          <CDropdownItem onClick={handleLogout}>
            <CIcon icon={cilAccountLogout} className="me-2" />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      {/* ⭐ PASSWORD MODAL */}
      <CModal
        visible={showResetModal}
        size="lg"
        onClose={() => setShowResetModal(false)}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Change Password</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <ResetPassword ref={resetRef} setLoading={setULoading} />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowResetModal(false)}>
            Close
          </CButton>

          <CButton color="primary" disabled={uloading} onClick={handleUpdatePassword}>
            {uloading ? 'Updating...' : 'Update Password'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AppHeaderDropdown
