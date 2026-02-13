/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import { CButton, CContainer } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilWarning } from '@coreui/icons'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <CContainer
      fluid
      className="d-flex justify-content-center align-items-center"
      
    >
      <div className="text-center mt-5">
        <CIcon
          icon={cilWarning}
          size="3xl"
          className="mb-3"
          style={{ color: '#f9a825' }}
        />

        <h1 className="fw-bold" style={{ fontSize: '4rem' }}>
          404
        </h1>

        <h4 className="mb-3">Page Not Found</h4>

        <p className="text-muted mb-4">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>

        <CButton
          color="primary"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </CButton>
      </div>
    </CContainer>
  )
}

export default NotFound
