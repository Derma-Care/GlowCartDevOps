import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CButton, CFormInput, CRow, CCol } from '@coreui/react'
import OnboardSuccess from './OnboardSuccess'
import { useNavigate } from 'react-router-dom'
import { updateStep2 } from '../APIs/FinalRegistrationApi'
import { processFile } from '../Utills/fileUtils'
import { UploadedPreview } from '../Utills/FileUpload'
import { showCustomToast } from '../../../Utils/Toaster'
import { NGK_COLORS } from '../../../Constant/Themes'
import { Row } from 'react-bootstrap'
import ClipLoader from 'react-spinners/ClipLoader'
import DermaCareLogo from '../../../assets/images/logoP.png'
export default function PrizePostDetails({ form, setForm, onSubmit, userData }) {
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   // smooth scroll window (fallback)
  //   window.scrollTo({ top: 0, behavior: 'smooth' })

  //   // smooth scroll the scrollable container
  //   const panel = document.querySelector('.form-panel')
  //   if (panel) {
  //     panel.scrollTo({ top: 0, behavior: 'smooth' })
  //   }
  // }, [])

  const navigate = useNavigate()
  // ------------ UPDATE FORM ------------
  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ------------ FETCH LOCATION (PROMISE) ------------
  // const handleGetLocation = () => {
  //   return new Promise((resolve) => {
  //     if (!navigator.geolocation) {
  //       showCustomToast('Location is not supported on this device', 'error')

  //       resolve(false)
  //       return
  //     }

  //     setLoadingLocation(true)

  //     navigator.geolocation.getCurrentPosition(
  //       async (pos) => {
  //         try {
  //           const { latitude, longitude } = pos.coords
  //           const response = await fetch(
  //             `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
  //           )
  //           const data = await response.json()

  //           const readable = data.display_name || `${latitude}, ${longitude}`
  //           updateForm('address', readable)
  //         } catch {
  //           showCustomToast('Unable to fetch address', 'error')
  //         }

  //         setLoadingLocation(false)
  //         resolve(true)
  //       },
  //       () => {
  //         setLoadingLocation(false)
  //         showCustomToast('Location permission denied', 'error')

  //         // alert('Location permission denied')
  //         resolve(false)
  //       },
  //     )
  //   })
  // }
  const handleGetLocation = async () => {
    // 1️⃣ Check if user previously blocked permission
    if (navigator.permissions) {
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' })
        if (perm.state === 'denied') {
          showCustomToast(
            'Location is blocked in your browser. Please enable it from Settings → Site Permissions.',
            'error',
          )
          return false
        }
      } catch (e) {
        // Safari does not support permissions API—ignore
      }
    }

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        showCustomToast('Location is not supported on this device', 'error')
        resolve(false)
        return
      }

      setLoadingLocation(true)

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            )

            const data = await response.json()

            updateForm('address', data.display_name || `${latitude}, ${longitude}`)
          } catch {
            showCustomToast('Unable to fetch address', 'error')
          }

          setLoadingLocation(false)
          resolve(true)
        },
        (error) => {
          setLoadingLocation(false)

          if (error.code === 1) {
            showCustomToast(
              'Location permission denied. Please enable it in browser settings.',
              'error',
            )
          } else {
            showCustomToast('Unable to get your location.', 'error')
          }

          resolve(false)
        },
      )
    })
  }

  const handleSubmit = async () => {
    if (loading) return // prevent double click

    setLoading(true) // 🔥 SHOW LOADER

    try {
      if (!form.address.trim()) {
        const fetched = await handleGetLocation()
        if (!fetched) {
          setLoading(false)
          return
        }
      }

      if (!form.address.trim()) {
        showCustomToast('Address is required!', 'error')

        setLoading(false)
        return
      }

      const step2Payload = {
        address: form.address,
      }

      console.log('Sending Step2 Payload:', step2Payload)

      const result = await updateStep2(userData.mobile, step2Payload)
      console.log(result)
      if (!result.success) {
        const errorMessage = result.message || 'Failed to update Step 2!'
        showCustomToast(errorMessage, 'error')
        setLoading(false)
        return
      }
      if (result.status == 400) {
        const errorMessage = result.message || 'Failed to update Step 2!'
        showCustomToast(errorMessage, 'error')
      }

      // On success:
      onSubmit()
      navigate('/onboard-success', {
        state: { name: userData.fullName,data: userData},
      })

      sessionStorage.removeItem('ngk_session')
      sessionStorage.removeItem('registraionCode')
      sessionStorage.clear() // full clear optional

      console.log('Success..Moving to onboard success')
    } catch (err) {
      console.log('🔥 FULL ERROR:', err)

      // Extract API message safely
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.data?.message ||
        err?.response?.data?.error ||
        null

      const finalMessage = apiMessage || 'Something went wrong!'

      showCustomToast(finalMessage, 'error')
    }

    setLoading(false) // 🔥 HIDE LOADER
  }

  const canSubmit = form.address.trim() !== ''

  return (
    <>
      <div
        style={{
          width: '100%',
          borderRadius: 20,
          minHeight: '80vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',

          overflow: 'hidden', // 🚀 Disable scrolling COMPLETELY
        }}
      >
        <div style={{ width: '100%', maxWidth: 450 }}>
          {/* CENTERED CONTENT */}
          <div className="mobileSpin d-flex flex-column justify-content-center align-items-center mb-5">
            <img
              src={DermaCareLogo}
              alt="logo"
              style={{
                height: 100,
                borderRadius: 12,
                objectFit: 'fill',
              }}
            />

            <h4
              className="m-0 fw-bold text-center w-100 gradient-text"
              style={{ letterSpacing: 0.5 }}
            >
              Enter Your Delivery Address
            </h4>
          </div>

          {/* ADDRESS FIELD */}
          <CRow>
            <CCol md={12} className="mt-2">
              <CFormInput
                placeholder="Enter your full address"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
                style={{
                  borderRadius: 12,
                  padding: 14,
                  border: `1px solid ${NGK_COLORS.primarySoft}`,
                }}
              />
            </CCol>

            {/* LOCATION BUTTON */}
            <CCol md={12} className="mt-3 d-flex justify-content-center">
              <CButton
                variant="outline"
                style={{
                  width: '100%',
                  maxWidth: 300,
                  borderRadius: 12,
                  padding: '14px 0',
                  fontWeight: '600',
                  border: `1px solid ${NGK_COLORS.primarySoft}`,
                  color: NGK_COLORS.primary,
                }}
                onClick={handleGetLocation}
                disabled={loadingLocation}
              >
                {/* {loadingLocation ? 'Fetching...' : '📌 Use Location'} */}
                {loadingLocation ? (
                  <>
                    <ClipLoader size={18} color={NGK_COLORS.primary} />
                    <span style={{ marginLeft: 8 }}>Fetching...</span>
                  </>
                ) : (
                  '📌 Use Location'
                )}
              </CButton>
            </CCol>
          </CRow>

          {/* SUBMIT BUTTON */}
          {canSubmit && (
            <CButton
              style={{
                marginTop: 20,
                backgroundColor: NGK_COLORS.primary,
                width: '100%',
                padding: '14px 0',
                borderRadius: 12,
                fontWeight: '700',
                fontSize: 17,
                color: 'white',
                border: 'none',
              }}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Please wait...' : 'Complete Registration'}
            </CButton>
          )}
        </div>
      </div>
    </>
  )
}
