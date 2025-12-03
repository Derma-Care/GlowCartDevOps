import React, { useEffect, useState } from 'react'
import { Wheel } from 'react-custom-roulette'
import './SpinWheel.css'
import { getWheelSlices } from '../APIs/getWheelSlices'
import { sendSpinReward } from '../APIs/SendSpinReward'
import { showCustomToast } from '../../../Utils/Toaster'

export default function SpinWheel({ onResult, userData, setUserData }) {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [slices, setSlices] = useState([])
  const [winningSliceId, setWinningSliceId] = useState(null)
  const [loading, setLoading] = useState(true)

  const wheelSize =
    window.innerWidth < 350 ? 180 : window.innerWidth < 420 ? 220 : 320

  // ===================== LOAD FROM BACKEND =====================
  useEffect(() => {
    loadSlices()
  }, [])

  const loadSlices = async () => {
    const response = await getWheelSlices(userData.mobile)

    if (response.success) {
      const allSlices = response.data.allSlices
      const winningId = response.data.winningSliceId

      const formatted = allSlices.map((item) => ({
        id: item.id,
        option: item.option,
        src: item.src ? `data:image/png;base64,${item.src}` : null,
      }))

      setSlices(formatted)
      setWinningSliceId(winningId)

      // If spin already completed → jump to stored result
      if (userData.spinWheelCompleted && userData.spinRewardId) {
        const idx = formatted.findIndex((s) => s.id === userData.spinRewardId)
        if (idx !== -1) setPrizeNumber(idx)
      }
    }

    setLoading(false)
  }

  // Wheel display formatting
  const data = slices.map((item) => ({
    option: item.option,
    style: {
      fontSize: item.option.length > 12 ? 12 : 16,
      textAlign: 'center',
      whiteSpace: 'pre-line',
    },
  }))

  // ====================== SPIN BUTTON ======================
  const handleSpinClick = async () => {
    if (mustSpin || slices.length === 0) return

    if (userData.spinWheelCompleted) {
      showCustomToast('You already completed your spin! 🎉', 'info')
      return
    }

    // Convert backend chosen slice → index
    const winnerIndex = slices.findIndex((s) => s.id === winningSliceId)

    if (winnerIndex === -1) {
      showCustomToast('Invalid slice configuration', 'error')
      return
    }

    setPrizeNumber(winnerIndex)
    setMustSpin(true)

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
  }

  // ====================== LOADER ======================
  if (loading || slices.length === 0) {
    return (
      <div style={loaderStyles.overlay}>
        <div style={loaderStyles.loaderWrapper}>
          <div className="spinner"></div>
          <div style={loaderStyles.textBlock}>
            <p style={loaderStyles.text}>Loading wheel...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="spin-container">
      <div className="wheel-wrapper">
        <Wheel
          wheelSize={wheelSize}
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          textColors={['#ffffff']}
          backgroundColors={[
            '#ff9933',
            '#ffcc00',
            '#ff6666',
            '#66cc66',
            '#66a3ff',
            '#cc66ff',
          ]}
          radiusLineColor="#fff"
          radiusLineWidth={2}
          outerBorderColor="#000"
          outerBorderWidth={4}
          innerBorderColor="#000"
          innerBorderWidth={6}
          perpendicularText={false}
          onStopSpinning={async () => {
            setMustSpin(false)
            document.body.style.overflow = 'auto'
            document.documentElement.style.overflow = 'auto'

            const winner = slices[prizeNumber]
            onResult(winner)

            const payload = { rewardId: winner.id }
            const response = await sendSpinReward(userData.mobile, payload)

            if (response.success) {
              showCustomToast('🎉 Reward saved!', 'success')
              setUserData(response.data)
            } else {
              showCustomToast(response.message || 'Failed to save reward', 'error')
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

// Loader Styles
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
