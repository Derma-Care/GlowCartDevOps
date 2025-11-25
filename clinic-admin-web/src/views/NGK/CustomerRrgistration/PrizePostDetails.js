import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CButton, CFormInput, CRow, CCol } from '@coreui/react'
import OnboardSuccess from './OnboardSuccess'
import { useNavigate } from 'react-router-dom'
import { updateStep2 } from '../APIs/FinalRegistrationApi'
import { processFile } from '../Utills/fileUtils'
import { UploadedPreview } from '../Utills/FileUpload'

export default function PrizePostDetails({ form, setForm, onSubmit, userData }) {
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // smooth scroll window (fallback)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // smooth scroll the scrollable container
    const panel = document.querySelector('.form-panel')
    if (panel) {
      panel.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

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
        // spinRewardId: form.spinRewardId,
        // spinRewardValue: form.spinRewardValue,
        // spinRewardImage: form.spinRewardImage,
        prizePostScreenshot: form.prizePostScreenshot,
        followScreenshot: form.followScreenshot,
        address: form.address,
      }

      console.log('Sending Step2 Payload:', step2Payload)

      const result = await updateStep2(userData.mobile, step2Payload)

      if (!result.success) {
        alert('Failed to update Step 2!')
        setLoading(false)
        return
      }

      // On success:
      onSubmit()
      navigate('/onboard-success', {
        state: { name: userData.fullName },
      })

      // localStorage.removeItem('ngk_customer')
      // localStorage.removeItem('saved_winnerPrize')

      // 🚀 sessionStorage cleanup
      sessionStorage.removeItem('ngk_session')
      sessionStorage.clear() // full clear optional

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
      <>
        <div
          style={{
            width: '100%',
            borderRadius: 20,
            padding: 24,
          }}
          className="form-panel"
        >
          <div>
            {/* TITLE */}
            <h3
              className="fw-bold"
              style={{
                color: '#ff2e85',
                textAlign: 'center',
                marginBottom: 30,
                fontSize: 28,
                letterSpacing: 0.5,
              }}
            >
              🎁 Claim Your Prize
            </h3>

            {/* STEP 1 */}
            <div style={{ marginBottom: 30 }}>
              <p
                style={{
                  fontWeight: 700,
                  marginBottom: 10,
                  fontSize: 17,
                  color: '#333',
                }}
              >
                1️⃣ Upload Prize Post Screenshot
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <label
                  style={{
                    border: '2px dashed #ffb3d4',
                    borderRadius: 14,
                    padding: '20px 14px',
                    width: '100%',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#fff6fb',
                    color: '#ff2e85',
                    fontWeight: '600',
                    fontSize: 15,
                    transition: '0.3s',
                  }}
                >
                  📷 Upload Screenshot
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

            {/* STEP 2 */}
            <div style={{ marginBottom: 30 }}>
              <p
                style={{
                  fontWeight: 700,
                  marginBottom: 10,
                  fontSize: 17,
                  color: '#333',
                }}
              >
                2️⃣ Enter Your Address
              </p>

              <CRow>
                <CCol md={8} className="mt-2">
                  <CFormInput
                    placeholder="Enter your full address"
                    value={form.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                    style={{
                      borderRadius: 12,
                      padding: 14,
                      border: '1px solid #e3e3e3',
                      background: '#fafafa',
                    }}
                  />
                </CCol>

                <CCol md={4} className="mt-2">
                  <CButton
                    color="secondary"
                    variant="outline"
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      padding: '14px 0',
                      fontWeight: '600',
                      borderColor: '#bbb',
                    }}
                    onClick={handleGetLocation}
                    disabled={loadingLocation}
                  >
                    {loadingLocation ? 'Fetching...' : '📌 Use Location'}
                  </CButton>
                </CCol>
              </CRow>
            </div>

            {/* FOLLOW US */}
            <div
              style={{
                background: '#fff1f9',
                padding: 18,
                borderRadius: 14,
                textAlign: 'center',
                marginBottom: 22,
                border: '1px solid #ffd4ea',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  color: '#ff2e85',
                  fontWeight: 700,
                }}
              >
                ⭐ Follow Us on Instagram
              </p>
            </div>

            <CButton
              style={{
                width: '100%',
                background: '#ff2e85',
                color: 'white',
                padding: '12px 0',
                borderRadius: 12,
                marginBottom: 28,
                fontWeight: '700',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                border: 'none',
              }}
              onClick={() =>
                window.open('https://www.instagram.com/glowkaart?igsh=Yjc0MGF1bXJibW5p', '_blank')
              }
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/174/174855.png"
                style={{ width: 22, height: 22 }}
              />
              Visit Instagram Profile
            </CButton>

            {/* STEP 3 */}
            <div style={{ marginBottom: 30 }}>
              <p
                style={{
                  fontWeight: 700,
                  marginBottom: 10,
                  fontSize: 17,
                  color: '#333',
                }}
              >
                3️⃣ Upload Follow Screenshot
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <label
                  style={{
                    border: '2px dashed #ffb3d4',
                    borderRadius: 14,
                    padding: '20px 14px',
                    width: '100%',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#fff6fb',
                    color: '#ff2e85',
                    fontWeight: '600',
                    fontSize: 15,
                  }}
                >
                  📁 Upload Screenshot
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
                {loading ? 'Please wait...' : '✔ Submit & Complete Registration'}
              </CButton>
            )}
          </div>
        </div>
      </>

      {/* {showSuccess && (
        <OnboardSuccess visible={true} onClose={() => setShowSuccess(false)} name={form.fullName} />
      )} */}
    </>
  )
}
