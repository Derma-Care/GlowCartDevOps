import React, { useState, useRef, useEffect } from 'react'
import { CCarousel, CCarouselItem, CModal, CModalBody } from '@coreui/react'
import DermaCareLogo from '../../assets/images/ad.jpg'
import adVideo from '../../assets/images/ad.mp4'

export default function AdCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const videoRef = useRef(null)

  const adsData = [
    { type: 'image', url: DermaCareLogo },
    { type: 'video', url: adVideo },
    {
      type: 'image',
      url: 'https://img.freepik.com/premium-vector/blue-cosmetics-podium-mockup-promo-background_8071-50411.jpg?w=2000',
    },
  ]

  const currentAd = adsData[activeIndex]
  const isVideo = currentAd.type === 'video'

  // auto-play video when active
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [activeIndex])

  return (
    <>
      <div
        className="ad-container"
        style={{
          position: 'relative',
          height: '250px',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {/* FULLSCREEN ICON */}
        <div
          onClick={() => setShowFullscreen(true)}
          className="fullscreen-icon"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.6)',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '18px',
            opacity: 0,
            zIndex: 999,
            transition: 'opacity 0.3s ease',
          }}
        >
          ⛶ Fullscreen
        </div>

        {/* CAROUSEL (only slides have pointerEvents: none) */}
        <CCarousel
          controls
          indicators
          interval={isVideo ? false : 3000}
          onSlide={(i) => setActiveIndex(i)}
          style={{
            height: '100%',
          }}
        >
          {adsData.map((item, index) => (
            <CCarouselItem key={index}>
              {/* IMAGE SLIDE */}
              {item.type === 'image' && (
                <img
                  src={item.url}
                  style={{
                    width: '100%',
                    height: '250px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                />
              )}

              {/* VIDEO SLIDE */}
              {item.type === 'video' && (
                <video
                  ref={videoRef}
                  src={item.url}
                  muted
                  controls // FIX: controls working
                  style={{
                    width: '100%',
                    height: '250px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                />
              )}
            </CCarouselItem>
          ))}
        </CCarousel>
      </div>

      {/* HOVER EFFECT */}
      <style>
        {`
          .ad-container:hover .fullscreen-icon {
            opacity: 1 !important;
          }
        `}
      </style>

      {/* FULLSCREEN MODAL */}
      <CModal visible={showFullscreen} onClose={() => setShowFullscreen(false)} size="xl">
        <CModalBody
          style={{
            padding: 0,
            backgroundColor: '#000',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* CLOSE BUTTON */}
          <div
            onClick={() => setShowFullscreen(false)}
            style={{
              position: 'absolute',
              top: '15px',
              right: '20px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              zIndex: 1000,
              fontSize: '18px',
            }}
          >
            ✕
          </div>

          {/* FULLSCREEN IMAGE */}
          {currentAd.type === 'image' && (
            <img
              src={currentAd.url}
              style={{
                width: '100%',
                height: '90vh',
                objectFit: 'contain',
              }}
            />
          )}

          {/* FULLSCREEN VIDEO */}
          {currentAd.type === 'video' && (
            <video
              src={currentAd.url}
              autoPlay
              controls
              style={{
                width: '100%',
                height: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </CModalBody>
      </CModal>
    </>
  )
}
