import React, { useState } from 'react'
import { CCard, CCardBody, CButton, CFormInput } from '@coreui/react'
import OnboardSuccess from './OnboardSuccess'
import { useNavigate } from 'react-router-dom'
import { updateStep2 } from '../APIs/FinalRegistrationApi'
import { processFile } from '../Utills/fileUtils'
import { UploadedPreview } from '../Utills/FileUpload'

export default function PrizePostDetails({ form, setForm, onSubmit }) {
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  // ------------ UPDATE FORM ------------
  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ------------ FETCH LOCATION (PROMISE) ------------
  const handleGetLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        alert('Location is not supported on this device')
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

            const readable = data.display_name || `${latitude}, ${longitude}`
            updateForm('address', readable)
          } catch {
            alert('Unable to fetch address')
          }

          setLoadingLocation(false)
          resolve(true)
        },
        () => {
          setLoadingLocation(false)
          alert('Location permission denied')
          resolve(false)
        },
      )
    })
  }

  // ------------ SUBMIT (AUTO LOCATION IF EMPTY) ------------
  // const handleSubmit = async () => {
  //   // Auto-fetch location if address empty
  //   if (!form.address.trim()) {
  //     const fetched = await handleGetLocation()
  //     if (!fetched) return
  //   }

  //   if (!form.prizePostScreenshot) {
  //     alert('Upload your Prize Post screenshot!')
  //     return
  //   }

  //   if (!form.address.trim()) {
  //     alert('Address is required!')
  //     return
  //   }

  //   if (!form.followScreenshot) {
  //     alert('Upload your Follow Page screenshot!')
  //     return
  //   }

  //   onSubmit() // parent handles full final submission
  //   navigate('/onboard-success', {
  //     state: {
  //       name: form.fullName,
  //     },
  //   })
  //   localStorage.removeItem('saved_form')
  //   localStorage.removeItem('saved_winnerPrize')
  //   localStorage.removeItem('step_submitted')
  //   localStorage.removeItem('step_showWheel')
  //   localStorage.removeItem('step_instagram')
  //   localStorage.removeItem('step_isRegistration')

  //   console.log('/onboard-success')
  //   console.log(form.fullName)
  // }

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

      if (!form.prizePostScreenshot) {
        alert('Upload your Prize Post screenshot!')
        setLoading(false)
        return
      }

      if (!form.address.trim()) {
        alert('Address is required!')
        setLoading(false)
        return
      }

      if (!form.followScreenshot) {
        alert('Upload your Follow Page screenshot!')
        setLoading(false)
        return
      }

      const step2Payload = {
        spinRewardId: form.spinRewardId,
        spinRewardValue: form.spinRewardValue,
        // spinRewardImage: form.spinRewardImage,
        prizePostScreenshot: form.prizePostScreenshot,
        followScreenshot: form.followScreenshot,
        address: form.address,
      }

      console.log('Sending Step2 Payload:', step2Payload)

      const result = await updateStep2(form.mobile, step2Payload)

      if (!result.success) {
        alert('Failed to update Step 2!')
        setLoading(false)
        return
      }

      // On success:
      onSubmit()
      navigate('/onboard-success', {
        state: { name: form.fullName },
      })

      localStorage.removeItem('saved_form')
      localStorage.removeItem('saved_winnerPrize')
      localStorage.removeItem('step_submitted')
      localStorage.removeItem('step_showWheel')
      localStorage.removeItem('step_instagram')
      localStorage.removeItem('step_isRegistration')

      console.log('Success..Moving to onboard success')
    } catch (err) {
      console.log('Error:', err)
      alert('Something went wrong!')
    }

    setLoading(false) // 🔥 HIDE LOADER
  }

  const canSubmit = form.prizePostScreenshot && form.address.trim() !== '' && form.followScreenshot

  return (
    <>
      <CCard
        style={{
          width: '100%',
          borderRadius: 16,
          padding: 20,
          border: 'none',
        }}
      >
        <CCardBody>
          {/* TITLE */}
          <h3
            className="fw-bold w-100"
            style={{
              color: '#ff2e85',
              textAlign: 'center',
              marginBottom: 25,
              fontSize: 26,
            }}
          >
            🎁 Prize Collection Steps
          </h3>

          {/* STEP 1 */}
          <div style={{ marginBottom: 25 }}>
            <p
              style={{
                fontWeight: 600,
                marginBottom: 8,
                fontSize: 16,
                color: '#333',
              }}
            >
              1️⃣ Upload Prize Post Screenshot
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px',
                alignContent: 'center',
                alignItems: 'center',
              }}
            >
              <label
                style={{
                  border: '2px dashed #ff95c9',
                  borderRadius: 12,
                  padding: '18px',
                  width: '100%',
                  textAlign: 'center',
                  display: 'block',
                  cursor: 'pointer',
                  background: '#fff8fc',
                  color: '#ff2e85',
                  fontWeight: '500',
                  fontSize: 15,
                }}
              >
                📷 Tap to upload image
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return

                    try {
                      const base64 = await processFile(file)
                      updateForm('prizePostScreenshot', base64)
                    } catch (err) {
                      alert(err.message)
                      e.target.value = ''
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>
              <UploadedPreview src={form.prizePostScreenshot} />
            </div>
          </div>

          {/* STEP 2 - ADDRESS */}
          <div style={{ marginBottom: 25 }}>
            <p
              style={{
                fontWeight: 600,
                marginBottom: 8,
                fontSize: 16,
                color: '#333',
              }}
            >
              2️⃣ Your Address
            </p>

            <CFormInput
              type="text"
              placeholder="Enter your full address"
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
              style={{
                borderRadius: 10,
                padding: 12,
                border: '1px solid #ddd',
                background: '#fafafa',
                marginBottom: 12,
              }}
            />

            <CButton
              color="secondary"
              variant="outline"
              style={{
                width: '100%',
                borderRadius: 10,
                padding: '10px 0',
                fontWeight: '600',
              }}
              onClick={handleGetLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? 'Fetching Location...' : '📌 Use Current Location'}
            </CButton>
          </div>

          {/* STEP 3 - FOLLOW US */}
          <div
            style={{
              background: '#fff0fa',
              padding: 18,
              borderRadius: 14,
              border: '1px dashed #ff2e85',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 16,
                color: '#ff2e85',
                fontWeight: 600,
              }}
            >
              ⭐ Follow our Instagram Page
            </p>
          </div>

          <CButton
            style={{
              width: '100%',
              background: '#ff2e85',
              color: 'white',
              border: 'none',
              padding: '12px 0',
              borderRadius: 12,
              marginBottom: 25,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontSize: 16,
            }}
            onClick={() =>
              window.open('https://www.instagram.com/glowkaart?igsh=Yjc0MGF1bXJibW5p', '_blank')
            }
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/174/174855.png"
              style={{ width: 22, height: 22 }}
            />
            Follow Us on Instagram
          </CButton>

          {/* STEP 4 */}
          <div style={{ marginBottom: 25 }}>
            <p
              style={{
                fontWeight: 600,
                marginBottom: 8,
                fontSize: 16,
                color: '#333',
              }}
            >
              3️⃣ Upload Follow Screenshot
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px',
                alignContent: 'center',
                alignItems: 'center',
              }}
            >
              <label
                style={{
                  border: '2px dashed #ff95c9',
                  borderRadius: 12,
                  padding: '18px',
                  width: '100%',
                  textAlign: 'center',
                  display: 'block',
                  cursor: 'pointer',
                  background: '#fff8fc',
                  color: '#ff2e85',
                  fontWeight: '500',
                  fontSize: 15,
                }}
              >
                📁 Tap to upload screenshot
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return

                    try {
                      const base64 = await processFile(file)
                      updateForm('followScreenshot', base64)
                    } catch (err) {
                      alert(err.message)
                      e.target.value = ''
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>
              <UploadedPreview src={form.followScreenshot} />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          {canSubmit && (
            <CButton
              style={{
                backgroundColor: '#ff2e85',
                width: '100%',
                padding: '12px 0',
                borderRadius: 12,
                fontWeight: '600',
                fontSize: 17,
                color: 'white',
              }}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Please wait...' : '✔ Submit & Register'}
            </CButton>
          )}
        </CCardBody>
      </CCard>
      {/* {showSuccess && (
        <OnboardSuccess visible={true} onClose={() => setShowSuccess(false)} name={form.fullName} />
      )} */}
    </>
  )
}
