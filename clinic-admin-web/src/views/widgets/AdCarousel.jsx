import React, { useState, useRef, useEffect } from 'react'
import { CCarousel, CCarouselItem, CModal, CModalBody } from '@coreui/react'
import axios from 'axios'
import DermaCareLogo from '../../assets/images/ad.jpg'
import adVideo from '../../assets/images/ad.mp4'
import { wifiUrl } from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

export default function AdCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const videoRef = useRef(null)
  const [adsData, setAdsData] = useState([])

  // 🔹 Fetch ads from backend
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await http.get(`/admin/clinic-ads`)

        if (res.data && res.data.length > 0) {
          const backendAds = res.data.map((item) => ({
            type: item.type,
            url: item.url,
          }))
          setAdsData(backendAds)
        } else {
          // fallback if empty
          setAdsData([
            { type: 'image', url: DermaCareLogo },
            { type: 'video', url: adVideo },
          ])
        }
      } catch (err) {
        console.log('Ads fetch failed → using dummy ads')
        setAdsData([
          { type: 'image', url: DermaCareLogo },
          { type: 'video', url: adVideo },
        ])
      }
    }

    fetchAds()
  }, [])

  const currentAd = adsData[activeIndex]
  const isVideo = currentAd?.type === 'video'

  // 🔹 Auto-play when video becomes active
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [activeIndex, isVideo])

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
        {/* 🕒 Loading State (NO early return) */}
        {adsData.length === 0 ? (
          <div
            style={{
              height: '250px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#eee',
              borderRadius: '12px',
            }}
          >
            Loading ads...
          </div>
        ) : (
          <>
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

            {/* CAROUSEL */}
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
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      style={{
                        width: '100%',
                        height: '250px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                      }}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      src={item.url}
                      muted
                      controls
                      onEnded={() => {
                        // go to next ad when video finishes
                        setActiveIndex((prev) => (prev + 1) % adsData.length)
                      }}
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
          </>
        )}
      </div>

      {/* Hover effect for fullscreen icon */}
      <style>
        {`
          .ad-container:hover .fullscreen-icon {
            opacity: 1 !important;
          }
        `}
      </style>

      {/* FULLSCREEN MODAL */}
      {adsData.length > 0 && (
        <CModal visible={showFullscreen} onClose={() => setShowFullscreen(false)} size="xl">
          <CModalBody
            style={{
              padding: 0,
              backgroundColor: '#000',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Close Button */}
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

            {/* IMAGE FULLSCREEN */}
            {currentAd?.type === 'image' && (
              <img
                src={currentAd.url}
                style={{
                  width: '100%',
                  height: '90vh',
                  objectFit: 'contain',
                }}
              />
            )}

            {/* VIDEO FULLSCREEN */}
            {currentAd?.type === 'video' && (
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
      )}
    </>
  )
}
