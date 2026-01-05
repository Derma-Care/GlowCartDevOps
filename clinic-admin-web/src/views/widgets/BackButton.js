import React, { useState } from 'react'
import { CButton } from '@coreui/react'
import { useNavigation } from '../Usecontext/NavigationProvider'
import { showCustomToast } from '../../Utils/Toaster'
import { BASE_URL } from '../../baseUrl'
import axios from 'axios'

const BackButton = ({ initialStatus = true }) => {
  const { goBack } = useNavigation()
  const [isOnline, setIsOnline] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  const toggleStatus = async () => {
    const clinicId = localStorage.getItem('HospitalId')

    if (!clinicId) {
      showCustomToast('❌ Clinic ID not found')
      return
    }

    const newStatus = !isOnline // We flip the status locally
    const payload = { online: newStatus }

    setLoading(true)

    try {
      const { data } = await axios.put(
        `${BASE_URL}/clinic/${clinicId}/online-status`,
        payload
      )

      console.log("🔍 Server Response:", data)

      if (data?.success === true) {
        setIsOnline(newStatus)

        // show backend message
        const msg = data?.message || (newStatus ? "Clinic is Online" : "Clinic is Offline")
        showCustomToast(
          newStatus
            ? `🟢 ${msg}`
            : `🔴 ${msg}`
        )
      }

      else {
        throw new Error("Backend didn't return success")
      }

    } catch (error) {
      console.error("❌ Error updating status:", error)
      showCustomToast("❌ Failed to update clinic status")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

      {/* 🔄 Online / Offline Toggle */}
      <div
        onClick={!loading ? toggleStatus : null}
        style={{
          width: '80px',
          height: '35px',
          borderRadius: '24px',
          backgroundColor: isOnline ? '#2ecc71' : '#e74c3c',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: '0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOnline ? 'flex-end' : 'flex-start',
          padding: '0 5px',
          position: 'relative',
        }}
      >
        <span
          style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: '12px',
            position: 'absolute',
            left: isOnline ? '10px' : 'auto',
            right: isOnline ? 'auto' : '10px',
          }}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>

        <div
          style={{
            width: '25px',
            height: '25px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        ></div>
      </div>

      {/* 🔙 Back Button */}
      <CButton onClick={goBack}
        style={{
          height: '44px',
          padding: '0 22px',
          borderRadius: '10px',
          fontWeight: '500',
          borderColor: '#7e57c2',
          color: '#7e57c2',
        }}
        variant="outline" >
        Back
      </CButton>
    </div>
  )
}

export default BackButton
