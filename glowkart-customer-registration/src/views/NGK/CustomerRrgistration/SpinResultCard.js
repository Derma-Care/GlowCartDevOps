import React, { useEffect, useRef, useState } from 'react'
import { CCard, CCardBody, CButton } from '@coreui/react'
import html2canvas from 'html2canvas'
import DermaCareLogo from '../../../assets/images/logoP.png'
import bg from '../../../assets/images/bg.png'
import { showCustomToast } from '../../../Utils/Toaster'
import { toast } from 'react-toastify'
import LoadingIndicator from '../../../Utils/loader'
import './SpinWheel.css'
import { NGK_COLORS } from '../../../Constant/Themes'
export default function SpinResultCard({ prize, onReset, setInstagram, form, userData }) {
  const cardRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [localPrize, setLocalPrize] = useState(null)

  const finalPrize = userData || prize

  if (!finalPrize) return <p>No prize found</p>

  //   const handleShare = async () => {
  //     try {
  //       setLoading(true)

  //       const caption = `I just won ${finalPrize.spinRewardValue} an exciting gift from Neha's GlowKart! 🎁✨
  // Thanks to Neha's GlowKart for the amazing surprises! 💖
  // #nkgderma #GlowKartWinner #GlowKartGifts #LuckySpin `

  //       // ---------------------------
  //       // 1. COPY CAPTION (with fallback)
  //       // ---------------------------
  //       try {
  //         await navigator.clipboard.writeText(caption)
  //         console.log('Clipboard: success')
  //       } catch (err) {
  //         console.warn('Clipboard API failed, using fallback', err)

  //         // Fallback copy
  //         const textarea = document.createElement('textarea')
  //         textarea.value = caption
  //         textarea.style.position = 'fixed'
  //         textarea.style.opacity = '0'
  //         document.body.appendChild(textarea)
  //         textarea.select()
  //         document.execCommand('copy')
  //         document.body.removeChild(textarea)
  //       }

  //       // ---------------------------
  //       // 2. VALIDATE cardRef
  //       // ---------------------------
  //       if (!cardRef.current) {
  //         setLoading(false)
  //         toast.error('❌ Unable to capture image (ref missing).')
  //         return
  //       }

  //       // ---------------------------
  //       // 3. GENERATE IMAGE SAFELY
  //       // ---------------------------
  //       const canvas = await html2canvas(cardRef.current, {
  //         scale: 2,
  //         useCORS: true,
  //         allowTaint: false,
  //         logging: false,
  //       })

  //       const image = canvas.toDataURL('image/png')

  //       console.log('Canvas generated successfully')

  //       // ---------------------------
  //       // 4. DOWNLOAD IMAGE (Safari / iOS Safe)
  //       // ---------------------------
  //       const link = document.createElement('a')
  //       link.href = image
  //       link.download = `NGlowKart-Prize-${finalPrize.spinRewardValue}.png`

  //       document.body.appendChild(link)
  //       link.click()
  //       document.body.removeChild(link)

  //       showCustomToast(
  //         '📸 Image saved & caption copied! 🚀 Opening Instagram…',
  //         { autoClose: 2800 },
  //         'top-left',
  //       )

  //       // ---------------------------
  //       // 5. DELAY & SHOW INSTAGRAM POPUP
  //       // ---------------------------
  //       setTimeout(() => {
  //         const instaTab = window.open('https://instagram.com', '_blank')
  //         if (!instaTab) toast.error('⚠️ Enable popups to continue.')
  //         setInstagram(true)

  //         setLoading(false)
  //       }, 5000)
  //     } catch (err) {
  //       console.error('🔥 handleShare error:', err)
  //       setLoading(false)
  //       toast.error('❌ Something went wrong.')
  //     }
  //   }

  const handleShare = async () => {
    try {
      setLoading(true)

      const caption = `I just won ${finalPrize.spinRewardValue} an exciting gift from Neha's GlowKart! 🎁✨
Thanks to Neha's GlowKart for the amazing surprises! 💖
#nkgderma #GlowKartWinner #GlowKartGifts #LuckySpin`

      // Copy caption
      try {
        await navigator.clipboard.writeText(caption)
      } catch {
        const textarea = document.createElement('textarea')
        textarea.value = caption
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        textarea.remove()
      }

      // Generate Image
      if (!cardRef.current) {
        toast.error('Unable to capture the image.')
        setLoading(false)
        return
      }

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
      })

      const image = canvas.toDataURL('image/png')

      // Download Image
      const link = document.createElement('a')
      link.href = image
      link.download = `NGlowKart-Prize-${finalPrize.spinRewardValue}.png`
      link.click()

      showCustomToast('📸 Image saved & caption copied! 🚀 Opening Instagram…')

      // -------- 100% RELIABLE INSTAGRAM OPENING --------
      const instagramApp = 'instagram://app'
      const instagramWeb = 'https://www.instagram.com'

      // Try opening Instagram app
      window.location.href = instagramApp

      // If app fails → open browser after 1 sec
      setTimeout(() => {
        window.open(instagramWeb, '_blank')
      }, 900)

      // After 5 seconds → go to next step (Instagram Screenshot Page)
      setTimeout(() => {
        setInstagram(true)
        setLoading(false)
      }, 5000)
    } catch (err) {
      console.error(err)
      setLoading(false)
      toast.error('Something went wrong.')
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // ⭐ centers vertically
        alignItems: 'center', // ⭐ centers horizontally
        padding: '20px 0',
      }}
    >
      <div className="header-container">
        <h4 className="m-0 fw-bold text-center w-100 gradient-text">Here’s Your Reward!</h4>

        {/* <h4 className="m-0 fw-bold text-center w-100 gradient-text">Registration</h4> */}
        {/* <small className="sub-gradient-text">Registration</small> */}
      </div>
      {/* CARD */}
      <CCard
        ref={cardRef}
        className="spin-result-card"
        style={{
          width: '100%',
          borderRadius: 22,
          border: 'none',
          background: 'linear-gradient(135deg, #e6efffff, #ffd8ec)',
          boxShadow: '0 8px 30px rgba(255, 0, 102, 0.15)',

          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginTop: '20px',
        }}
      >
        <CCardBody style={{ padding: '20px 18px' }}>
          {/* HEADER */}
          <div className="d-flex align-items-center justify-content-start">
            <img
              src={DermaCareLogo}
              alt="logo"
              style={{
                // width: 52,
                height: 70,
                // padding: 8,
                borderRadius: 14,

                background: '#fff',
                boxShadow: '0px 4px 10px rgba(255, 255, 255, 0.75)',
              }}
            />
          </div>

          {/* TITLE */}
          <h3
            style={{
              fontFamily: 'AmsterdamTwo, sans-serif',
              color: NGK_COLORS.primary,
              marginBottom: 10,
              fontSize: 'clamp(20px, 5vw, 26px)',
              fontWeight: 700,
              textAlign: 'center',
              marginTop: '25px',
            }}
          >
            Congratulations!
          </h3>

          <p
            style={{
              textAlign: 'center',
              fontSize: 15,
              marginTop: '15px',
              display: 'inline-block',
              padding: '5px 15px',
              backgroundColor: NGK_COLORS.primary, // or any color for the strip
              color: 'white', // text color
              borderRadius: '5px', // optional for rounded strip
            }}
          >
            {finalPrize.fullName}
          </p>

          <p
            style={{
              textAlign: 'center',
              fontSize: 15,
              marginTop: '5px',
              fontWeight: 'bold',
              color: NGK_COLORS.primary,
            }}
          >
            You Won:
          </p>

          {/* PRIZE DISPLAY */}

          <div className="d-flex align-items-center justify-content-center" style={{ gap: '60px' }}>
            {/* Left Section: Text */}
            <div>
              <h4
                style={{
                  margin: 0,
                  color: NGK_COLORS.primary,
                  fontSize: 'clamp(20px, 5vw, 24px)',
                  textAlign: 'center',
                }}
              >
                {finalPrize.spinRewardValue}
              </h4>
              <p
                style={{
                  fontSize: '16px',
                  color: '#555',
                  marginTop: '5px',
                  marginLeft: '5%',
                  textAlign: 'center',
                }}
              >
                a premium {finalPrize.spinRewardValue} as a prize!
              </p>
            </div>
            <div
              className="prize-circle"
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
              <img
                src={
                  finalPrize.spinRewardImage?.startsWith('data:')
                    ? finalPrize.spinRewardImage
                    : `data:image/png;base64,${finalPrize.spinRewardImage}`
                }
                alt="Prize"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
              )
            </div>
          </div>
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
          borderLeft: `4px solid ${NGK_COLORS.primary}`,
          fontSize: 15,
          animation: 'blinkGlow 1.6s infinite ease-in-out',
        }}
      >
        <p style={loaderStyles.desc}>
          Share your winning moment on Instagram to proceed to the next step and provide your
          delivery address.
        </p>

        <p style={{color:NGK_COLORS.primary}}>[optional]</p>
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
      <div className="d-flex justify-content-end">
        <CButton className="share-btn" onClick={handleShare}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/174/174855.png"
            className="ig-icon"
            alt="instagram"
            style={{ backgroundColor: 'white', padding: '2px', borderRadius: '5px' }}
          />
          Share on Instagram
        </CButton>
      </div>

      {loading && (
        <div style={loaderStyles.overlay}>
          <div style={loaderStyles.card}>
            <div className="spin-loader"></div>

            <h3 style={loaderStyles.title}>Opening Instagram…</h3>

            <p style={loaderStyles.desc}>
              📸 Your image has been downloaded and the caption has been copied.
              <br />
              Please upload it on Instagram and paste the caption.
              <br />
              Also, please tag our Instagram page @ngkderma while posting.
            </p>
          </div>

          <style>
            {`
      .spin-loader {
        width: 65px;
        height: 65px;
        border: 6px solid #ffd4ec;
        border-top-color: #D2025B;
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
    background: 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '20px',
  },

  card: {
    textAlign: 'center',
    maxWidth: '450px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },

  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#D2025B',
    margin: 0,
  },

  desc: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#D2025B',
    lineHeight: '22px',
    margin: 0,
  },
}
