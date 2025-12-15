import React, { Suspense, useEffect, } from 'react'
import {  Route, Routes, Navigate,   } from 'react-router-dom'
 
import {   useColorModes } from '@coreui/react'
import './scss/style.scss'
 
 

 
 
 
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

 
import { injectTheme, NGK_COLORS } from './Constant/Themes'
import OnboardSuccess from './views/NGK/CustomerRrgistration/OnboardSuccess'
import NGlowKartPatientRegistration_CoreUI from './views/NGK/CustomerRrgistration/CustomerRegistration'
import SpinResultCard from './views/NGK/CustomerRrgistration/SpinResultCard'
import RegistrationSoon from './views/NGK/CustomerRrgistration/RegistrationSoon'
 
 
import DermaCareLogo from './assets/images/logoP.png'
import { showCustomToast } from './Utils/Toaster'
import useNetwork from './views/NGK/Utills/networkInterceptor'
const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  // const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    injectTheme()
  }, [])

  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search)
  //   const theme = urlParams.get('theme')?.match(/^[A-Za-z0-9\s]+/)?.[0]

  //   if (theme) {
  //     setColorMode(theme)
  //   } else if (!isColorModeSet()) {
  //     setColorMode(storedTheme)
  //   }
  // }, [storedTheme, isColorModeSet, setColorMode])

  useEffect(() => {
    setColorMode('light') // Always force light mode
  }, [])

 

  const { online, speed } = useNetwork()

  const prevState = React.useRef({ online: online, speed: speed })

  useEffect(() => {
    // If first render → don't show "Internet Connected"
    if (prevState.current.online === undefined) {
      prevState.current = { online, speed }
      return
    }

    // 1️⃣ When offline → show error
    if (!online) {
      showCustomToast('❌ No Internet Connection', 'error')
    }

    // 2️⃣ When slow internet → show warning
    else if (speed === 'slow') {
      showCustomToast('⚠️ Slow Internet... Please wait', 'warning')
    }

    // 3️⃣ Show "Connected" ONLY when:
    //    - Previously offline → now online
    //    - Previously slow → now fast
    else if (
      (prevState.current.online === false && online === true) ||
      (prevState.current.speed === 'slow' && speed === 'fast')
    ) {
      showCustomToast('✅ Internet Connected', 'success')
    }

    // save previous state
    prevState.current = { online, speed }
  }, [online, speed])

  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            backgroundColor: '#fff', // optional
          }}
        >
          <img
            src={DermaCareLogo}
            alt="Loading"
            style={{
              width: '120px',
              animation: 'pulseGlow 1.5s infinite ease-in-out',
            }}
          />
        </div>
      }
    >
      <Routes>
        {/* ✅ Lowercase redirect for consistency */}
        <Route path="/" element={<Navigate to="/NGK-Registration-Form" replace />} />

        {/* Public routes */}
        <Route path="/NGK-Registration-Form" element={<NGlowKartPatientRegistration_CoreUI />} />
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="/404" element={<Page404 />} />
        <Route path="/500" element={<Page500 />} />
        {/* <Route path="/NGK-Registration-Form" element={<NGlowKartPatientRegistration_CoreUI />} /> */}
        <Route path="/launch" element={<RegistrationSoon />} />

        {/* <Route path="/" element={<SpinResultCard />} /> */}
        <Route path="/onboard-success" element={<OnboardSuccess />} />
        {/* <Route path="/resetPassword" element={<ResetPasswordForm />} /> */}

        {/* Protected routes - catch all */}
        {/* <Route
          path="*"
          element={
            <ProtectedRoute>
              <div className={showPayoutAuth ? 'blur-background' : ''}>
                <DefaultLayout />
              </div>
            </ProtectedRoute>
          }
        /> */}
      </Routes>
      {/* <PayoutAuthModal
        visible={showPayoutAuth}
        onClose={() => setShowPayoutAuth(false)}
        onSuccess={() => {
          setShowPayoutAuth(false)
          navigate('/payouts')
        }}
      /> */}
    </Suspense>
  )
}

export default App
