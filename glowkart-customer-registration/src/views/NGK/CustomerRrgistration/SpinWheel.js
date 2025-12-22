import React, { useEffect, useState } from 'react'
import { Wheel } from 'react-custom-roulette'
import './SpinWheel.css'
import { getWheelSlices } from '../APIs/getWheelSlices'
import { sendSpinReward } from '../APIs/SendSpinReward'
import { showCustomToast } from '../../../Utils/Toaster'
import { NGK_COLORS } from '../../../Constant/Themes'
import DermaCareLogo from '../../../assets/images/logoP.png'
export default function SpinWheel({ onResult, userData, setUserData }) {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [slices, setSlices] = useState([])
  const [winningSliceId, setWinningSliceId] = useState(null)
  const [loading, setLoading] = useState(true)

  const wheelSize = window.innerWidth < 350 ? 180 : window.innerWidth < 420 ? 220 : 320

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
      // fontSize: item.option.length > 12 ? 12 : 16,
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
            <style>
              {' '}
              {`
            .spinner {
              width: 58px;
              height: 58px;
              border: 6px solid #ffd4ec;
              border-top-color: ${NGK_COLORS.primary};
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}{' '}
            </style>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="header-container"></div>
      <div className="spin-container  d-flex flex-column align-items-center ">
        <div className="mobileSpin justify-content-center align-items-center d-flex flex-column">
          <img
            src={DermaCareLogo}
            alt="logo"
            style={{
              height: 100,
              borderRadius: 12,
              objectFit: 'fill',
              // border: '1px solid #eee',
            }}
          />

          <h4 className="m-0 fw-bold text-center w-100 gradient-text">Spin And Win</h4>
        </div>
        <div className="wheel-wrapper mt-4">
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
                transform: window.innerWidth < 480 ? 'scale(0.55)' : 'scale(0.76)',
                transformOrigin: 'top',
              },
            }}
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
    </>
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
    color: NGK_COLORS.primary,
    marginBottom: '10px',
  },
}
// import React, { useEffect, useState } from 'react'
// import { Wheel } from 'react-custom-roulette'
// import './SpinWheel.css'
// import { getWheelSlices } from '../APIs/getWheelSlices'
// import { sendSpinReward } from '../APIs/SendSpinReward'
// import { showCustomToast } from '../../../Utils/Toaster'
// import { NGK_COLORS } from '../../../Constant/Themes'

// export default function SpinWheel({ onResult, userData, setUserData }) {
//   const [mustSpin, setMustSpin] = useState(false)
//   const [prizeNumber, setPrizeNumber] = useState(0)
//   const wheelSize = window.innerWidth < 350 ? 180 : window.innerWidth < 420 ? 220 : 320
//   const [slices, setSlices] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     loadSlices()
//   }, [])

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//     const panel = document.querySelector('.form-panel')
//     if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' })
//   }, [])

//   const loadSlices = async () => {
//     const response = await getWheelSlices(userData.mobile)

//     if (response.success) {
//       const formatted = response.data.map((item) => ({
//         id: item.id,
//         option: item.option,
//         src: item.src ? `data:image/png;base64,${item.src}` : null,
//       }))

//       setSlices(formatted)
//     } else {
//       console.error('Failed to load slices')
//     }

//     setLoading(false)
//   }

//   // Prepare data for the wheel display
//   const data = slices.map((item) => ({
//     option: item.option,
//     style: {
//       fontSize: item.option.length > 12 ? 12 : 16,
//       textAlign: 'center',
//       whiteSpace: 'pre-line',
//     },
//   }))

//   // Updated handleSpinClick with rank-based slice selection
//   const handleSpinClick = () => {
//     if (mustSpin || slices.length === 0) return

//     if (userData.spinWheelCompleted) {
//       showCustomToast('You have already completed your spin! 🎉', 'info')
//       return
//     }

//     const totalSlices = slices.length // usually 12
//     const rank = userData.registrationRank || 0

//     let allowedIndices

//     if (rank <= 500) {
//       // Allow slices 0 to 5 for rank 1 to 500
//       allowedIndices = [...Array(6).keys()] // [0,1,2,3,4,5]
//     } else {
//       // Allow slices 6 to 11 for rank above 500
//       allowedIndices = [...Array(6).keys()].map((i) => i + 6) // [6,7,8,9,10,11]
//     }

//     // Pick a random index from allowed indices
//     const randomIndex = allowedIndices[Math.floor(Math.random() * allowedIndices.length)]

//     setPrizeNumber(randomIndex)
//     setMustSpin(true)

//     // Lock scrolling during spin
//     document.body.style.overflow = 'hidden'
//     document.documentElement.style.overflow = 'hidden'
//   }

//   if (loading || slices.length === 0) {
//     return (
//       <div style={loaderStyles.overlay}>
//         <div style={loaderStyles.loaderWrapper}>
//           <div className="spinner" style={{ color: NGK_COLORS.primary }}></div>
//           <div style={loaderStyles.textBlock}>
//             <p style={loaderStyles.text}>Loading wheel...</p>
//           </div>
//         </div>

//         <style>
//           {`
//             .spinner {
//               width: 58px;
//               height: 58px;
//               border: 6px solid #ffd4ec;
//               border-top-color: ${NGK_COLORS.primary};
//               border-radius: 50%;
//               animation: spin 1s linear infinite;
//             }
//             @keyframes spin {
//               from { transform: rotate(0deg); }
//               to { transform: rotate(360deg); }
//             }
//           `}
//         </style>
//       </div>
//     )
//   }

//   return (
//     <div className="spin-container">
//       <div className="wheel-wrapper">
//         <Wheel
//           wheelSize={wheelSize}
//           mustStartSpinning={mustSpin}
//           prizeNumber={prizeNumber}
//           data={data}
//           textColors={['#ffffff']}
//           backgroundColors={['#ff9933', '#ffcc00', '#ff6666', '#66cc66', '#66a3ff', '#cc66ff']}
//           radiusLineColor="#fff"
//           radiusLineWidth={2}
//           outerBorderColor="#000"
//           outerBorderWidth={4}
//           innerBorderColor="#000"
//           innerBorderWidth={6}
//           perpendicularText={false}
//           fontSize={16}
//           pointerProps={{
//             style: {
//               transform: window.innerWidth < 480 ? 'scale(0.50)' : 'scale(0.65)',
//               transformOrigin: 'top',
//             },
//           }}
//           onStopSpinning={async () => {
//             setMustSpin(false)

//             document.body.style.overflow = 'auto'
//             document.documentElement.style.overflow = 'auto'

//             const panel = document.querySelector('.form-panel')
//             if (panel) panel.style.overflow = 'auto'

//             const winner = {
//               id: slices[prizeNumber].id,
//               option: slices[prizeNumber].option,
//               src: slices[prizeNumber].src || null,
//             }

//             onResult(winner)

//             const rewardPayload = {
//               rewardId: winner.id,
//             }

//             const response = await sendSpinReward(userData.mobile, rewardPayload)

//             if (response.success) {
//               showCustomToast(response.message || '🎉 Reward saved!', 'success')
//               setUserData(response.data)
//             } else {
//               showCustomToast(response.message || 'Failed to save reward', 'error')
//             }
//           }}
//         />

//         <button className="spin-btn" onClick={handleSpinClick} disabled={mustSpin}>
//           Spin
//         </button>
//       </div>
//     </div>
//   )
// }

// const loaderStyles = {
//   overlay: {
//     position: 'fixed',
//     inset: 0,
//     background: 'rgba(255, 255, 255, 0.95)',
//     backdropFilter: 'blur(6px)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 9999,
//   },
//   loaderWrapper: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     textAlign: 'center',
//     maxWidth: '380px',
//     padding: '20px',
//   },
//   textBlock: { marginTop: '20px' },
//   text: {
//     fontSize: '20px',
//     fontWeight: 700,
//     color: NGK_COLORS.primary,
//     marginBottom: '10px',
//   },
// }
// import React, { useEffect, useState } from 'react'
// import { Wheel } from 'react-custom-roulette'
// import './SpinWheel.css'
// import { getWheelSlices } from '../APIs/getWheelSlices'
// import { sendSpinReward } from '../APIs/SendSpinReward'
// import { showCustomToast } from '../../../Utils/Toaster'

// export default function SpinWheel({ onResult, userData, setUserData }) {
//   const [mustSpin, setMustSpin] = useState(false)
//   const [prizeNumber, setPrizeNumber] = useState(0)
//   const wheelSize = window.innerWidth < 350 ? 180 : window.innerWidth < 420 ? 220 : 320
//   // const [spinCompleted, setSpinCompleted] = useState(userData?.spinWheelCompleted || false)

//   const [slices, setSlices] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     loadSlices()
//   }, [])

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' })

//     const panel = document.querySelector('.form-panel')
//     if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' })
//   }, [])

//   const loadSlices = async () => {
//     const response = await getWheelSlices(userData.mobile)
//     // const response = await getWheelSlices()

//     if (response.success) {
//       const formatted = response.data.map((item) => ({
//         id: item.id,
//         option: item.option,
//         src: item.src ? `data:image/png;base64,${item.src}` : null,
//       }))

//       setSlices(formatted)
//     } else {
//       console.error('Failed to load slices')
//     }

//     setLoading(false)
//   }

//   // transform to wheel data
//   const data = slices.map((item) => ({
//     option: item.option,
//     style: {
//       fontSize: item.option.length > 12 ? 12 : 16,
//       textAlign: 'center',
//       whiteSpace: 'pre-line',
//     },
//   }))

//   // const handleSpinClick = () => {
//   //   // if (spinCompleted) {
//   //   //   showCustomToast('You have already completed your spin! 🎉', 'info')
//   //   //   return
//   //   // }

//   //   if (mustSpin || slices.length === 0) return

//   //   const randomIndex = Math.floor(Math.random() * slices.length)
//   //   setPrizeNumber(randomIndex)
//   //   setMustSpin(true)

//   //   document.body.style.overflow = 'hidden'
//   //   document.documentElement.style.overflow = 'hidden'

//   //   const panel = document.querySelector('.form-panel')
//   //   if (panel) panel.style.overflow = 'hidden'
//   // }

//   // const handleSpinClick = () => {
//   //   if (mustSpin || slices.length === 0) return

//   //   const totalSlices = slices.length // should be 12
//   //   const eligibleLimit = 7 // reward slices index 0–6

//   //   let randomIndex

//   //   // if (userData.isEligible) {
//   //   if (false) {
//   //     // ⭐ Eligible users → choose slice 1–7 (index 0–6)
//   //     randomIndex = Math.floor(Math.random() * eligibleLimit)
//   //   } else {
//   //     // ❌ Not eligible → choose slice 8–12 (index 7–11)
//   //     randomIndex = Math.floor(Math.random() * (totalSlices - eligibleLimit)) + eligibleLimit
//   //   }

//   //   setPrizeNumber(randomIndex)
//   //   setMustSpin(true)

//   //   document.body.style.overflow = 'hidden'
//   //   document.documentElement.style.overflow = 'hidden'

//   //   const panel = document.querySelector('.form-panel')
//   //   if (panel) panel.style.overflow = 'hidden'
//   // }

//   const handleSpinClick = () => {
//     if (mustSpin || slices.length === 0) return

//     if (userData.spinWheelCompleted) {
//       showCustomToast('You have already completed your spin! 🎉', 'info')
//       return
//     }

//     const randomIndex = Math.floor(Math.random() * slices.length)
//     setPrizeNumber(randomIndex)
//     setMustSpin(true)

//     // Lock scrolling during spin
//     document.body.style.overflow = 'hidden'
//     document.documentElement.style.overflow = 'hidden'
//   }

//   // ✅ FIX: return loader BEFORE rendering Wheel
//   if (loading || slices.length === 0) {
//     return (
//       <div style={loaderStyles.overlay}>
//         <div style={loaderStyles.loaderWrapper}>
//           <div className="spinner"></div>
//           <div style={loaderStyles.textBlock}>
//             <p style={loaderStyles.text}>Loading wheel...</p>
//           </div>
//         </div>

//         <style>
//           {`
//             .spinner {
//               width: 58px;
//               height: 58px;
//               border: 6px solid #ffd4ec;
//               border-top-color: #ff007f;
//               border-radius: 50%;
//               animation: spin 1s linear infinite;
//             }
//             @keyframes spin {
//               from { transform: rotate(0deg); }
//               to { transform: rotate(360deg); }
//             }
//           `}
//         </style>
//       </div>
//     )
//   }

//   return (
//     <div className="spin-container  ">
//       <div className="wheel-wrapper ">
//         <Wheel
//           wheelSize={wheelSize}
//           mustStartSpinning={mustSpin}
//           prizeNumber={prizeNumber}
//           data={data}
//           textColors={['#ffffff']}
//           backgroundColors={['#ff9933', '#ffcc00', '#ff6666', '#66cc66', '#66a3ff', '#cc66ff']}
//           radiusLineColor="#fff"
//           radiusLineWidth={2}
//           outerBorderColor="#000"
//           outerBorderWidth={4}
//           innerBorderColor="#000"
//           innerBorderWidth={6}
//           perpendicularText={false}
//           fontSize={16}
//           pointerProps={{
//             style: {
//               transform: window.innerWidth < 480 ? 'scale(0.50)' : 'scale(0.75)',
//               transformOrigin: 'top',
//             },
//           }}
//           onStopSpinning={async () => {
//             setMustSpin(false)

//             document.body.style.overflow = 'auto'
//             document.documentElement.style.overflow = 'auto'

//             const panel = document.querySelector('.form-panel')
//             if (panel) panel.style.overflow = 'auto'

//             const winner = {
//               id: slices[prizeNumber].id,
//               option: slices[prizeNumber].option,
//               src: slices[prizeNumber].src || null,
//             }

//             onResult(winner)

//             const rewardPayload = {
//               rewardId: winner.id,
//             }
//             console.log('Backend Spin Response:', userData)

//             const response = await sendSpinReward(userData.mobile, rewardPayload)

//             console.log('Backend Spin Response:', response)

//             if (response.success) {
//               showCustomToast(response.message || '🎉 Reward saved!', 'success')
//               setUserData(response.data)
//               // 🔥 LOCK the wheel now
//               // setSpinCompleted(true)

//               // Optional: save to localStorage
//               // localStorage.setItem('spinWheelCompleted', 'true')
//             } else {
//               console.log('⚠️ Backend error:', response.message)
//             }
//           }}
//         />

//         <button className="spin-btn" onClick={handleSpinClick} disabled={mustSpin}>
//           Spin
//         </button>
//       </div>
//     </div>
//   )
// }

// const loaderStyles = {
//   overlay: {
//     position: 'fixed',
//     inset: 0,
//     background: 'rgba(255, 255, 255, 0.95)',
//     backdropFilter: 'blur(6px)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 9999,
//   },
//   loaderWrapper: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     textAlign: 'center',
//     maxWidth: '380px',
//     padding: '20px',
//   },
//   textBlock: { marginTop: '20px' },
//   text: {
//     fontSize: '20px',
//     fontWeight: 700,
//     color: '#ff007f',
//     marginBottom: '10px',
//   },
// }
// import React, { useEffect, useState } from 'react'
// import { Wheel } from 'react-custom-roulette'
// import './SpinWheel.css'
// import { getWheelSlices } from '../APIs/getWheelSlices'
// import { sendSpinReward } from '../APIs/SendSpinReward'
// import { showCustomToast } from '../../../Utils/Toaster'

// export default function SpinWheel({ onResult, userData, setUserData }) {
//   const [mustSpin, setMustSpin] = useState(false)
//   const [prizeNumber, setPrizeNumber] = useState(0)
//   const [slices, setSlices] = useState([])
//   const [loading, setLoading] = useState(true)

//   const wheelSize = window.innerWidth < 350 ? 180 : window.innerWidth < 420 ? 220 : 320

//   useEffect(() => {
//     loadSlices()
//   }, [])

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//     const panel = document.querySelector('.form-panel')
//     if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' })
//   }, [])

//   const loadSlices = async () => {
//     const response = await getWheelSlices(userData.mobile)
//     if (response.success) {
//       const formatted = response.data.map((item) => ({
//         id: item.id,
//         option: item.option,
//         src: item.src ? `data:image/png;base64,${item.src}` : null,
//       }))
//       setSlices(formatted)

//       // If spin already completed, set prizeNumber to backend reward index
//       if (userData.spinWheelCompleted && userData.spinRewardId) {
//         const winnerIndex = formatted.findIndex((slice) => slice.id === userData.spinRewardId)
//         if (winnerIndex !== -1) setPrizeNumber(winnerIndex)
//       }
//     } else {
//       console.error('Failed to load slices')
//     }
//     setLoading(false)
//   }

//   const handleSpinClick = async () => {
//     if (mustSpin || slices.length === 0) return

//     // If already spun, just show the backend reward
//     if (userData.spinWheelCompleted && userData.spinRewardId) {
//       const winnerIndex = slices.findIndex((slice) => slice.id === userData.spinRewardId)
//       if (winnerIndex !== -1) {
//         setPrizeNumber(winnerIndex)
//         setMustSpin(true)
//       }
//       showCustomToast('You have already completed your spin! 🎉', 'info')
//       return
//     }

//     // First spin → call backend to get assigned reward
//     const response = await sendSpinReward(userData.mobile, { rewardId: userData.spinRewardId })
//     if (response.success) {
//       setUserData(response.data)
//       const winnerIndex = slices.findIndex((slice) => slice.id === response.data.spinRewardId)
//       if (winnerIndex !== -1) {
//         setPrizeNumber(winnerIndex)
//         setMustSpin(true)
//       }
//     } else {
//       showCustomToast(response.message || 'Failed to spin', 'error')
//     }
//   }

//   if (loading || slices.length === 0) {
//     return (
//       <div style={loaderStyles.overlay}>
//         <div style={loaderStyles.loaderWrapper}>
//           <div className="spinner"></div>
//           <div style={loaderStyles.textBlock}>
//             <p style={loaderStyles.text}>Loading wheel...</p>
//           </div>
//         </div>
//         <style>
//           {`
//             .spinner {
//               width: 58px;
//               height: 58px;
//               border: 6px solid #ffd4ec;
//               border-top-color: #ff007f;
//               border-radius: 50%;
//               animation: spin 1s linear infinite;
//             }
//             @keyframes spin {
//               from { transform: rotate(0deg); }
//               to { transform: rotate(360deg); }
//             }
//           `}
//         </style>
//       </div>
//     )
//   }

//   const data = slices.map((item) => ({
//     option: item.option,
//     style: {
//       fontSize: item.option.length > 12 ? 12 : 16,
//       textAlign: 'center',
//       whiteSpace: 'pre-line',
//     },
//   }))

//   return (
//     <div className="spin-container">
//       <div className="wheel-wrapper">
//         <Wheel
//           wheelSize={wheelSize}
//           mustStartSpinning={mustSpin}
//           prizeNumber={prizeNumber}
//           data={data}
//           textColors={['#ffffff']}
//           backgroundColors={['#ff9933', '#ffcc00', '#ff6666', '#66cc66', '#66a3ff', '#cc66ff']}
//           radiusLineColor="#fff"
//           radiusLineWidth={2}
//           outerBorderColor="#000"
//           outerBorderWidth={4}
//           innerBorderColor="#000"
//           innerBorderWidth={6}
//           perpendicularText={false}
//           fontSize={16}
//           pointerProps={{
//             style: {
//               transform: window.innerWidth < 480 ? 'scale(0.50)' : 'scale(0.75)',
//               transformOrigin: 'top',
//             },
//           }}
//           onStopSpinning={() => {
//             setMustSpin(false)
//             const winner = slices[prizeNumber]
//             onResult(winner)
//             showCustomToast('🎉 Spin completed!', 'success')
//           }}
//         />
//         <button className="spin-btn" onClick={handleSpinClick} disabled={mustSpin}>
//           Spin
//         </button>
//       </div>
//     </div>
//   )
// }

// const loaderStyles = {
//   overlay: {
//     position: 'fixed',
//     inset: 0,
//     background: 'rgba(255, 255, 255, 0.95)',
//     backdropFilter: 'blur(6px)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 9999,
//   },
//   loaderWrapper: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     textAlign: 'center',
//     maxWidth: '380px',
//     padding: '20px',
//   },
//   textBlock: { marginTop: '20px' },
//   text: {
//     fontSize: '20px',
//     fontWeight: 700,
//     color: '#ff007f',
//     marginBottom: '10px',
//   },
// }
