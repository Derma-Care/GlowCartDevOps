import React, { useEffect, useState } from 'react'
import { Wheel } from 'react-custom-roulette'
import './SpinWheel.css'
import { getWheelSlices } from '../APIs/getWheelSlices'
import { sendSpinReward } from '../APIs/SendSpinReward'
import { showCustomToast } from '../../../Utils/Toaster'

export default function SpinWheel({ onResult, userData, setUserData }) {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const wheelSize = window.innerWidth < 350 ? 180 : window.innerWidth < 420 ? 220 : 320
  // const [spinCompleted, setSpinCompleted] = useState(userData?.spinWheelCompleted || false)

  const [slices, setSlices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSlices()
  }, [])

  useEffect(() => {
    // smooth scroll window (fallback)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // smooth scroll the scrollable container
    const panel = document.querySelector('.form-panels')
    if (panel) {
      panel.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const loadSlices = async () => {
    const response = await getWheelSlices()

    if (response.success) {
      const formatted = response.data.map((item) => ({
        id: item.id,
        option: item.option,
        src: item.src ? `data:image/png;base64,${item.src}` : null,
      }))

      setSlices(formatted)
    } else {
      console.error('Failed to load slices')
    }

    setLoading(false)
  }

  // transform to wheel data
  const data = slices.map((item) => ({
    option: item.option,
    style: {
      fontSize: item.option.length > 12 ? 12 : 16,
      textAlign: 'center',
      whiteSpace: 'pre-line',
    },
  }))

  const handleSpinClick = () => {
    // if (spinCompleted) {
    //   showCustomToast('You have already completed your spin! 🎉', 'info')
    //   return
    // }

    if (mustSpin || slices.length === 0) return

    const randomIndex = Math.floor(Math.random() * slices.length)
    setPrizeNumber(randomIndex)
    setMustSpin(true)

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    const container = document.querySelector('.spin-container')
    if (container) container.style.overflow = 'hidden'
  }

  // ✅ FIX: return loader BEFORE rendering Wheel
  if (loading || slices.length === 0) {
    return (
      <div style={loaderStyles.overlay}>
        <div style={loaderStyles.loaderWrapper}>
          <div className="spinner"></div>
          <div style={loaderStyles.textBlock}>
            <p style={loaderStyles.text}>Loading wheel...</p>
          </div>
        </div>

        <style>
          {`
            .spinner {
              width: 58px;
              height: 58px;
              border: 6px solid #ffd4ec;
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
    )
  }

  return (
    <div className="spin-container  ">
      <div className="wheel-wrapper ">
        <Wheel
          wheelSize={wheelSize}
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          textColors={['#ffffff']}
          backgroundColors={['#ff9933', '#ffcc00', '#ff6666', '#66cc66', '#66a3ff', '#cc66ff']}
          radiusLineColor="#fff"
          radiusLineWidth={2}
          outerBorderColor="#000"
          outerBorderWidth={4}
          innerBorderColor="#000"
          innerBorderWidth={6}
          perpendicularText={false}
          fontSize={16}
          pointerProps={{
            style: {
              transform: window.innerWidth < 480 ? 'scale(0.50)' : 'scale(0.75)',
              transformOrigin: 'top',
            },
          }}
          onStopSpinning={async () => {
            setMustSpin(false)

            document.body.style.overflow = 'auto'
            document.documentElement.style.overflow = 'auto'
            const container = document.querySelector('.spin-container')
            if (container) container.style.overflow = 'auto'

            const winner = {
              id: slices[prizeNumber].id,
              option: slices[prizeNumber].option,
              src: slices[prizeNumber].src || null,
            }

            onResult(winner)

            const rewardPayload = {
              rewardId: winner.id,
            }
            console.log('Backend Spin Response:', userData)

            const response = await sendSpinReward(userData.mobile, rewardPayload)

            console.log('Backend Spin Response:', response)

            if (response.success) {
              showCustomToast(response.message || '🎉 Reward saved!', 'success')
              setUserData(response.data)
              // 🔥 LOCK the wheel now
              // setSpinCompleted(true)

              // Optional: save to localStorage
              // localStorage.setItem('spinWheelCompleted', 'true')
            } else {
              console.log('⚠️ Backend error:', response.message)
            }
          }}
        />

        <button className="spin-btn" onClick={handleSpinClick} disabled={mustSpin}>
          Spin
        </button>
      </div>
    </div>
  )
}

const loaderStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '380px',
    padding: '20px',
  },
  textBlock: { marginTop: '20px' },
  text: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#ff007f',
    marginBottom: '10px',
  },
}
