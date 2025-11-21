import React, { useEffect, useState } from 'react'
import { Wheel } from 'react-custom-roulette'
import './SpinWheel.css'
import { getWheelSlices } from '../APIs/getWheelSlices'

export default function SpinWheel({ onResult }) {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const wheelSize = window.innerWidth < 350 ? 180 : window.innerWidth < 420 ? 220 : 320

  const [spinning, setSpinning] = useState(false)
  const [slices, setSlices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSlices()
  }, [])

  const loadSlices = async () => {
    const response = await getWheelSlices()

    if (response.success) {
      // API returns base64 image → convert properly
      const formatted = response.data.map((item) => ({
        id: item.id,
        option: item.option,
        src: item.src
          ? `data:image/png;base64,${item.src}` // base64 image
          : null,
      }))

      setSlices(formatted)
    } else {
      console.error('Failed to load slices')
    }

    setLoading(false)
  }

  {
    loading && (
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

  const data = slices.map((item) => {
    const isLong = item.option.length > 12
    return {
      option: item.option,
      style: {
        fontSize: isLong ? 12 : 16,
        textAlign: 'center',
        whiteSpace: 'pre-line', // enables wrapping
      },
    }
  })

  const handleSpinClick = () => {
    if (mustSpin) return
    const randomIndex = Math.floor(Math.random() * slices.length)
    setPrizeNumber(randomIndex)
    setMustSpin(true)
    setSpinning(true)

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    // Optional: disable scroll on container if in a wrapper
    const container = document.querySelector('.spin-container') // adjust to your wrapper
    if (container) container.style.overflow = 'hidden'
  }

  return (
    <div className="spin-container">
      {/* {spinning && (
        <div className="spin-loader">
          <div className="loader-circle"></div>
          <p>Spinning...</p>
        </div>
      )} */}
      <div className="wheel-wrapper">
        <Wheel
          wheelSize={wheelSize}
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          // wheelSize={160}

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
          onStopSpinning={() => {
            setMustSpin(false)
            document.body.style.overflow = 'auto'
            document.documentElement.style.overflow = 'auto'
            const container = document.querySelector('.spin-container')
            if (container) container.style.overflow = 'auto'

            onResult &&
              onResult({
                id: slices[prizeNumber].id,
                option: slices[prizeNumber].option,
                src: slices[prizeNumber].src || null,
              })
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
    maxWidth: '380px', // 👈 keeps paragraphs aligned
    padding: '20px',
  },

  textBlock: {
    marginTop: '20px',
  },

  text: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#ff007f',
    marginBottom: '10px',
  },

  textSmall: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#ff007f',
    lineHeight: '22px',
  },
}
