import React, { useEffect, useRef, useState } from 'react'
import { CCard, CCardBody, CButton } from '@coreui/react'
import html2canvas from 'html2canvas'
import DermaCareLogo from '../../../assets/images/logoN.png'
import bg from '../../../assets/images/bg.png'
import { showCustomToast } from '../../../Utils/Toaster'
import { toast } from 'react-toastify'
import LoadingIndicator from '../../../Utils/loader'

export default function SpinResultCard({ prize, onReset, setInstagram }) {
  const cardRef = useRef(null)
  const [loading, setLoading] = useState(false)

  const handleShare = async () => {
    try {
      setLoading(true) // start loader immediately

      await navigator.clipboard.writeText(
        `I just won ${prize.option} an exciting gift from Neha's GlowKart! 🎁✨
Thanks to Neha's GlowKart for the amazing surprises! 💖
#GlowKartWinner #GlowKartGifts #LuckySpin`,
      )

      const canvas = await html2canvas(cardRef.current, { scale: 2 })
      const image = canvas.toDataURL('image/png')

      const link = document.createElement('a')
      link.href = image
      link.download = `NGlowKart-Prize-${prize.option}.png`
      link.click()

      showCustomToast(
        '📸 Image saved & caption copied! 🚀 Opening Instagram…',
        { autoClose: 2800 },
        'top-left',
      )

      // ✨ Wait + show loader before redirecting
      setTimeout(() => {
        const instaTab = window.open('https://instagram.com', '_blank')
        if (!instaTab) toast.error('⚠️ Enable popups to continue.')
        setInstagram(true)
        setLoading(false) // hide loader
      }, 5000)
    } catch (err) {
      setLoading(false)
      toast.error('❌ Something went wrong.')
    }
  }

  const convertToBase64 = async (url) => {
    const sources = [url, `https://images.weserv.nl/?url=${encodeURIComponent(url)}`]

    for (const src of sources) {
      try {
        const base64 = await new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.src = src + '?cache=' + Date.now()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
          }
          img.onerror = () => resolve(null)
        })
        if (base64) return base64
      } catch {}
    }

    console.error('❌ All image sources failed:', url)
    return null
  }

  const [localImage, setLocalImage] = useState(null)

  useEffect(() => {
    if (prize?.src) {
      convertToBase64(prize.src).then(setLocalImage)
    }
  }, [prize])

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 560,
        margin: 'auto',
        padding: '16px',
      }}
    >
      {/* CARD */}
      <CCard
        ref={cardRef}
        style={{
          width: '100%',
          borderRadius: 22,
          border: 'none',
          background: 'linear-gradient(135deg, #ffe6f1, #ffd8ec)',
          boxShadow: '0 8px 30px rgba(255, 0, 102, 0.15)',
          marginTop: '100px',
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <CCardBody style={{ padding: '20px 18px' }}>
          {/* HEADER */}
          <div
            className="d-flex align-items-center justify-content-between"
            style={{
              gap: '10px',
              marginBottom: 15,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h4
                style={{
                  margin: 0,
                  color: '#ff2e85',
                  fontSize: 'clamp(16px, 4vw, 20px)',
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Neha’s Glow Kart
              </h4>
              <small style={{ color: '#999', fontSize: '14px', textAlign: 'center' }}>
                Beauty & Skin Essentials
              </small>
            </div>
            <img
              src={DermaCareLogo}
              alt="logo"
              style={{
                width: 52,
                height: 52,
                padding: 8,
                borderRadius: 14,
                background: '#fff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              }}
            />
          </div>

          {/* TITLE */}
          <h3
            style={{
              fontFamily: 'AmsterdamTwo, sans-serif',
              color: '#ff2e85',
              marginBottom: 10,
              fontSize: 'clamp(20px, 5vw, 26px)',
              fontWeight: 700,
              textAlign: 'center',
              marginTop: '25px',
            }}
          >
            Congratulations!
          </h3>

          <p style={{ textAlign: 'center', fontSize: 15, marginTop: '30px' }}>You Won:</p>

          {/* PRIZE DISPLAY */}
          {prize.src ? (
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ gap: '60px' }}
            >
              {/* Left Section: Text */}
              <div>
                <h4
                  style={{
                    margin: 0,
                    color: '#ff005c',
                    fontSize: 'clamp(18px, 5vw, 22px)',
                    textAlign: 'center',
                  }}
                >
                  {prize.option}
                </h4>
                <p style={{
                    fontSize: '16px',
                    color: '#555',
                    marginTop: '5px',
                    marginLeft: '5%',
                    textAlign: 'center',
                  }}>
                  a premium {prize.option} as a prize!
                </p>
              </div>
              <div
                style={{
                  width: 120, // Increased container size (optional)
                  height: 120,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  padding: 10, // Adds inner space so image isn't cropped

                  border: '3px solid #ff2e85',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0px 4px 10px rgba(0,0,0,0.15)',
                }}
              >
                {localImage ? (
                  <img
                    src={localImage}
                    alt="Prize"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <p style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading...</p>
                )}
              </div>
            </div>
          ) : (
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ gap: '40px' }}
            >
              <div className="w-50">
                <p
                  style={{
                    fontSize: '16px',
                    color: '#555',
                    marginTop: '5px',
                    marginLeft: '5%',
                    textAlign: 'center',
                  }}
                >
                  {prize.option} discount on all dermatology services on your{' '}
                  <span style={{ fontWeight: 'bold', color: '#ff2e85' }}>First</span> service
                  booking.
                </p>
              </div>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  padding: 10,
                  border: '3px solid #ff2e85',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column', // <<< Stack text vertically
                  boxShadow: '0px 4px 10px rgba(0,0,0,0.15)',
                  color: '#ff2e85',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1 }}>
                  {prize.option}
                </div>
                <span style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1 }}>OFF</span>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* NOTE */}
      {/* NOTE WITH BLINK ANIMATION */}
      <div
        style={{
          marginTop: 18,
          background: '#fff3fa',
          borderRadius: 12,
          padding: '14px 16px',
          borderLeft: '4px solid #ff007f',
          fontSize: 15,
          animation: 'blinkGlow 1.6s infinite ease-in-out',
        }}
      >
        <p style={{ margin: 0 }}>
          🔔 Share your winning moment on Instagram to continue to the next step.
        </p>
        <p style={{ marginTop: 6, fontSize: 13 }}>
          <strong>Note:</strong> After posting, take a screenshot — you'll upload it next.
        </p>
      </div>

      {/* Animation Styles */}
      <style>
        {`
    @keyframes blinkGlow {
      0% { box-shadow: 0 0 0 rgba(255,0,128,0); }
      50% { box-shadow: 0 0 12px rgba(255,0,128,0.4); }
      100% { box-shadow: 0 0 0 rgba(255,0,128,0); }
    }
  `}
      </style>

      {/* BUTTON */}

      <CButton
        style={{
          width: '100%',
          marginTop: '20px',
          background: '#ff007f',
          border: 'none',
          padding: '14px 5px',
          borderRadius: 12,
          fontSize: 'clamp(16px, 4vw, 18px)',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          color: 'white',
        }}
        disabled={prize.src ? !localImage : false}
        onClick={handleShare}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/174/174855.png"
          style={{ width: 22, height: 22 }}
        />
        Share on Instagram
      </CButton>

      {loading && (
        <div style={loaderStyles.overlay}>
          <div style={loaderStyles.box}>
            <div className="spinner"></div>
            <p style={loaderStyles.text}>Opening Instagram…</p>
            <p style={loaderStyles.text}>
              🎉 Image saved & caption copied!
              <br />
              Now just upload the image on Instagram and
              <br />
              paste the caption while posting.
            </p>
          </div>

          {/* Spinner Animation */}
          <style>
            {`
        .spinner {
          width: 55px;
          height: 55px;
          border: 5px solid #ffd4ec;
          border-top-color: #ff007f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}
          </style>
        </div>
      )}
    </div>
  )
}
const loaderStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  box: {
    textAlign: 'center',
  },
  text: {
    marginTop: '15px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#ff007f',
  },
}
