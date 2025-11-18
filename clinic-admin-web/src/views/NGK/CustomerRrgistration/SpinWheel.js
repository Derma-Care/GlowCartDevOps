import React, { useState } from 'react'
import { Wheel } from 'react-custom-roulette'
import './SpinWheel.css'

export default function SpinWheel({ onResult }) {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)

  const slices = [
    {
      id: '1',
      option: '💄 Lipstick',
      src: '/assets/images/1.png',
    },
    {
      id: '2',
      option: '💋 Liquid Matte Lipstick',
      src: '/assets/images/2.png',
    },
    { id: '3', option: '5%' },
    {
      id: '4',
      option: '🧴 BB Cream',
      src: '/assets/images/3.png',
    },
    { id: '5', option: '10%' },
    {
      id: '6',
      option: '👁️ Kajal / Eye Pencil',
      src: '/assets/images/4.png',
    },
    { id: '7', option: '15%' },
    {
      id: '8',
      option: '💅 Nail Polish',
      src: '/assets/images/5.png',
    },
    {
      id: '9',
      option: '🧖 Face Sheet Mask',
      src: '/assets/images/6.png',
    },
    { id: '10', option: '20%' },
    {
      id: '11',
      option: '👜 Mini Makeup Kit',
      src: '/assets/images/6.png',
    },
    { id: '12', option: '25%' }, // ⬅️ Wrapped into 2 lines
  ]

  // Format text: if long → small size + allow wrap
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

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    // Optional: disable scroll on container if in a wrapper
    const container = document.querySelector('.spin-container') // adjust to your wrapper
    if (container) container.style.overflow = 'hidden'
  }

  return (
    <div className="spin-container">
      <div className="wheel-wrapper">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          wheelSize={160}
          pointerProps={{
            style: { transform: 'scale(0.60)', fill: '#ff4f9a' },
          }}
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
