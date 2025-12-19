import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import { ToastContainer } from 'react-toastify'
import { HospitalProvider } from './views/Usecontext/HospitalContext'

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

import ProtectedRoute from './components/ProtectedRoute'
import { injectTheme, NGK_COLORS } from './Constant/Themes'
import OnboardSuccess from './views/NGK/CustomerRrgistration/OnboardSuccess'
import NGlowKartPatientRegistration_CoreUI from './views/NGK/CustomerRrgistration/CustomerRegistration'
import SpinResultCard from './views/NGK/CustomerRrgistration/SpinResultCard'
import RegistrationSoon from './views/NGK/CustomerRrgistration/RegistrationSoon'
import PayoutAuthModal from './views/Payouts/PayoutAuthModal'
import ResetPasswordForm from './views/Payouts/ResetPasswordForm'
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

  const navigate = useNavigate()
  const [showPayoutAuth, setShowPayoutAuth] = useState(false)

  useEffect(() => {
    const handler = () => setShowPayoutAuth(true)
    window.addEventListener('openPayoutAuth', handler)
    return () => window.removeEventListener('openPayoutAuth', handler)
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
        {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/404" element={<Page404 />} />
        <Route path="/500" element={<Page500 />} />
        <Route path="/NGK-Registration-Form" element={<NGlowKartPatientRegistration_CoreUI />} />
        <Route path="/launch" element={<RegistrationSoon />} />

        {/* <Route path="/" element={<SpinResultCard />} /> */}
        <Route path="/onboard-success" element={<OnboardSuccess />} />
        <Route path="/resetPassword" element={<ResetPasswordForm />} />

        {/* Protected routes - catch all */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <div className={showPayoutAuth ? 'blur-background' : ''}>
                <DefaultLayout />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
      <PayoutAuthModal
        visible={showPayoutAuth}
        onClose={() => setShowPayoutAuth(false)}
        onSuccess={() => {
          setShowPayoutAuth(false)
          navigate('/payouts')
        }}
      />
    </Suspense>
  )
}

export default App
