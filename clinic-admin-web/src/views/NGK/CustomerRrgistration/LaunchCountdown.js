import React, { useEffect, useState } from 'react'
import { NGK_COLORS } from '../../../Constant/Themes'

export default function LaunchCountdown({onComplete}) {
  const targetDate = new Date('2026-03-08T00:00:00').getTime()
  const [timeLeft, setTimeLeft] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const diff = targetDate - now

      if (diff <= 0) {
        clearInterval(interval)
        setTimeLeft({})
        setLoading(false)
        if (onComplete) onComplete()
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds })

      setLoading(false) // ✔ stop loader after first update
    }, 1000)

    return () => clearInterval(interval)
  }, [])
  const handleAppStore = () => {
    window.open('https://apps.apple.com/in/app/whatsapp-messenger/id310633997', '_blank')
  }

  const handlePlayStore = () => {
    window.open('https://play.google.com/store/apps/details?id=com.whatsapp', '_blank')
  }

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${NGK_COLORS.primary}, ${NGK_COLORS.primaryLight})`,
        padding: '24px',
        borderRadius: '18px',
        color: '#fff',
        textAlign: 'center',
        maxWidth: 420,
        margin: 'auto',
        boxShadow: '0 8px 25px rgba(255,0,128,0.25)',
      }}
    >
      {/* 🔥 Show loader before the first countdown is calculated */}
      {loading || !timeLeft ? (
        <div style={{ fontSize: 18, fontWeight: 600 }}>⏳ Loading...</div>
      ) : timeLeft.days !== undefined ? (
        <>
          <h2 style={{ marginBottom: 8, fontSize: 24, fontWeight: 700, color: 'white' }}>
            🚀 Launching the App Soon
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 20, color: 'white' }}>
            Going live on <strong>8th March 2026</strong>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
              <div
                key={unit}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '12px 10px',
                  borderRadius: 12,
                  width: 70,
                  backdropFilter: 'blur(5px)',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700 }}>{timeLeft[unit]}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{unit.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* 🎉 Successfully launched */
        <div style={{ marginTop: 10 }}>
          <h3 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
            🎉 App Launched!
          </h3>

          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              marginBottom: 16,
              marginTop: 20,
              opacity: 0.9,
              color: '#fff',
            }}
          >
            Download the app now from the App Store or Play Store.
          </p>

          {/* DOWNLOAD BUTTONS */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleAppStore}
              style={{
                flex: 1,
                padding: '6px 0',
                background: '#000',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
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
                padding: '6px 0',
                background: '#04A777',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
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
                alt="Play Store"
              />
              Play Store
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
