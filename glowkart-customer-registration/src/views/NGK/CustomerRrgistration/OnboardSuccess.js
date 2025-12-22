import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import LaunchCountdown from './LaunchCountdown'
import { CButton } from '@coreui/react'
import './SpinWheel.css'
import { NGK_COLORS } from '../../../Constant/Themes'
import DermaCareLogo from '../../../assets/images/logoP.png'
export default function OnboardSuccess({ visible = true }) {
  const [showInitialConfetti, setShowInitialConfetti] = useState(true)
  const [launchDone, setLaunchDone] = useState(false)

  const confettiRef = useRef(null)
  const location = useLocation()
  const { name, data } = location.state || {} // fallback if undefined
  console.log(location.state)
  console.log(name)

  useEffect(() => {
    if (!showInitialConfetti) return
    runConfetti()
    setTimeout(() => setShowInitialConfetti(false), 1000) // prevent looping
  }, [showInitialConfetti])

  useEffect(() => {
    if (!launchDone) return
    runConfetti()
  }, [launchDone])

  /** CONFETTI **/
  // useEffect(() => {
  //   if (!visible) return
  //   const canvas = confettiRef.current
  //   const ctx = canvas.getContext('2d')
  //   canvas.width = window.innerWidth
  //   canvas.height = window.innerHeight

  //   let particles = []
  //   const colors = ['#FF007F', '#FF8AB3', '#FFD6E6', '#FFCC66', '#66CCFF']

  //   function spawn(count = 90) {
  //     while (count--) {
  //       particles.push({
  //         x: Math.random() * window.innerWidth,
  //         y: Math.random() * 200,
  //         vx: (Math.random() - 0.5) * 4,
  //         vy: Math.random() * 4 + 1,
  //         size: Math.random() * 6 + 4,
  //         color: colors[Math.floor(Math.random() * colors.length)],
  //         life: 120,
  //       })
  //     }
  //   }

  //   function frame() {
  //     ctx.clearRect(0, 0, canvas.width, canvas.height)
  //     particles.forEach((p, i) => {
  //       ctx.fillStyle = p.color
  //       ctx.fillRect(p.x, p.y, p.size, p.size)
  //       p.x += p.vx
  //       p.y += p.vy
  //       p.vy += 0.07
  //       if (--p.life <= 0) particles.splice(i, 1)
  //     })
  //     requestAnimationFrame(frame)
  //   }

  //   spawn()
  //   frame()
  // }, [visible])

  /** ANIMATIONS **/
  const backdrop = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
  const card = { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } }
  const check = { hidden: { scale: 0 }, visible: { scale: 1 } }

  // const handleAppStore = () => {
  //   window.open('https://apps.apple.com/in/app/whatsapp-messenger/id310633997', '_blank')
  // }

  // const handlePlayStore = () => {
  //   window.open('https://play.google.com/store/apps/details?id=com.whatsapp', '_blank')
  // }

  const onClose = () => {
    console.log('calling')
    // window.location.replace('https://chiselontechnologies.com')
  }

  function runConfetti() {
    const canvas = confettiRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let particles = []
    const colors = ['#FF007F', '#FF8AB3', '#FFD6E6', '#FFCC66', '#66CCFF']

    function spawn(count = 90) {
      while (count--) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * 200,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 4 + 1,
          size: Math.random() * 6 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 120,
        })
      }
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, p.size, p.size)
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.07
        if (--p.life <= 0) particles.splice(i, 1)
      })
      requestAnimationFrame(frame)
    }

    spawn()
    frame()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdrop}
          style={{
            position: 'fixed',
            inset: 0,
            // background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            zIndex: 1000,
          }}
        >
          <canvas
            ref={confettiRef}
            style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
          />

          {/* CARD */}
          <motion.div
            variants={card}
            className="success-bg"
            style={{
              width: '90%',
              minWidth: 380,
              maxWidth: 600,
              background: '#fff',
              borderRadius: 18,
              padding: 32,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              textAlign: 'center',
            }}
          >
            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
              <motion.div
                variants={check}
                initial="hidden"
                animate="visible"
                style={{
                  background: `linear-gradient(135deg, ${NGK_COLORS.primary}, ${NGK_COLORS.primaryLight})`,
                  borderRadius: '50%',
                  padding: 12,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth={2.2} />
                </svg>
              </motion.div>

              <h2 style={{ fontSize: 24, color: '#d81b60', fontWeight: 600, margin: 0 }}>
                Hey {name} — Welcome to Neeha's GlowKart Family!
              </h2>

              {/* <button
                onClick={onClose}
                title="Navigating to other website"
                className="close-btn"
                style={{
                  marginLeft: 'auto',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 20,
                }}
              >
                ✕
              </button> */}
            </div>

            <p style={{ color: '#666', marginBottom: 25 }}>
              You're all set — enjoy exploring treatments, booking appointments, and unlocking
              exclusive offers.
            </p>
            <div className="mb-3">
              You will receive the gift <strong>({data.spinRewardValue})</strong>. It will be delivered to your
              registered delivery address within one week.
            </div>

            <LaunchCountdown onComplete={() => setLaunchDone(true)} />

            {/* <div>
         
              <p style={{ fontSize: 15, fontWeight: 600, color: '#444', marginBottom: 10 }}>
                📲 Download the app below
              </p>

            
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleAppStore}
                  style={{
                    flex: 1,
                    padding: '4px 0',
                    background: '#000',
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src="https://logos-world.net/wp-content/uploads/2021/02/App-Store-Logo.png"
                    style={{ width: 50 }}
                    alt="App Store"
                  />
                  App Store
                </button>

                <button
                  onClick={handlePlayStore}
                  style={{
                    flex: 1,
                    padding: '4px 0',
                    background: '#04A777',
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src="https://www.androidheadlines.com/wp-content/uploads/2017/05/Google-Play-Store-New-App-Icon.png"
                    style={{ width: 40 }}
                    alt=""
                  />
                  Play Store
                </button>
              </div>
            </div> */}

            {/* <CButton
              onClick={onClose}
              title="Navigating to other website"
              className="mt-2"
              style={{
                background: 'linear-gradient(90deg, #ff6fb1, #ff2e85)',
                border: 'none',
                padding: '14px 26px',
                margin: 'auto',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 16px rgba(255, 46, 133, 0.4)',
                cursor: 'pointer',
                transition: '0.25s',
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.90')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              🚀 Explore Website
            </CButton> */}

            <p style={{ marginTop: 20, fontSize: 13, color: '#777' }}>
              Please check your Instagram and WhatsApp for our exclusive offers.
            </p>
            <img
              src={DermaCareLogo}
              alt="logo"
              style={{
                height: 40,
                borderRadius: 12,
                objectFit: 'fill',
                // border: '1px solid #eee',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
