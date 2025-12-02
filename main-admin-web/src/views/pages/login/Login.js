import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilLockUnlocked } from '@coreui/icons'
import Logo from '../login/GlowKaart.png'
import {BASE_URL_API} from '../../../baseUrl'

const Login = () => {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [errorMessage, setErrorMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const location = useLocation()

  const from = location.state?.from?.pathname || '/clinic-management'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!userName && !password) {
      setErrorMessage('Username and password are required.')
      return
    }

    if (!userName) {
      setErrorMessage('Username is required.')
      return
    }

    if (!password) {
      setErrorMessage('Password is required.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = { userName, password }
      const response = await axios.post(`${BASE_URL_API}/login`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Log response to verify backend format
      console.log('API Response:', response.data)

      // Check for success message (correct spelling!)
      if (response.status === 200) {
        console.log('Login successful')
        navigate('/clinic-management')
        localStorage.setItem('userName', userName)
        localStorage.setItem('authentication', true) //flag
        navigate(from, { replace: true })
      } else {
        setErrorMessage(response.data || 'Invalid login credentials.')
      }
    } catch (error) {
      const backendMessage = error.response?.data?.message || 'An unexpected error occurred.'

      const lowerMessage = backendMessage.toLowerCase()

      if (lowerMessage.includes('both')) {
        setErrorMessage('Both Username and Password are Invalid.')
      } else if (lowerMessage.includes('username') && lowerMessage.includes('password')) {
        // in case backend sends a combined message
        setErrorMessage('Both Username and Password are Invalid.')
      } else if (lowerMessage.includes('username')) {
        setErrorMessage('Invalid username.')
      } else if (lowerMessage.includes('password')) {
        setErrorMessage('Invalid password.')
      } else {
        // generic or unexpected
        setErrorMessage(backendMessage)
      }

      console.error('Error details:', error.response || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (

    <div style={{ minHeight: '100vh',backgroundColor:"white" }}
      className="d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <h1 className="fw-bold" style={{ color: '#FF007F', textAlign: "center" }}>Neeha's GlowKart</h1>
            <CCardGroup className="shadow-lg rounded-4 overflow-hidden">

              {/* Login Form Card */}
              <CCard className="p-5" style={{ backgroundColor: '#ffffff' }}>
                <CCardBody>
                  <div className="text-center mb-4">
                    <h1>Login</h1>
                    <p className="text-secondary fs-6">
                      Sign in to access your dashboard and manage your clinics efficiently.
                    </p>
                  </div>
                  {errorMessage && <p className="text-danger">{errorMessage}</p>}
                  <CForm onSubmit={handleSubmit}>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        autoComplete="username"
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: 'pointer' }}
                      >
                        <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={12} className="text-end">
                        <CButton color="primary" type="submit" disabled={isLoading}>
                          {isLoading ? 'Logging in...' : 'Login'}
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              {/* Welcome/Brand Card */}
              <CCard className="text-white py-5 d-none d-md-block"
                style={{ width: '44%', background: '#d6e5ffff' }}>
                <CCardBody className="text-center">
                  <h2 style={{ color: 'black' }}>Welcome!</h2>
                  <p style={{ fontSize: '0.95rem', color: '#000' }}>
                    GlowKart helps streamline clinic operations efficiently. Track, coordinate, and manage your clinics seamlessly. </p>
                  <img src={Logo} alt="GlowKart Logo" style={{ width: '250px' }} />
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
