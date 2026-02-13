import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import routes from '../routes'
import LoadingIndicator from '../Utils/loader'
import NotFound from '../views/NotFound'

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      {/* <Suspense fallback={<LoadingIndicator message="Loading..." />}> */}
      <Routes>
        {routes.map((route, idx) => {
          return (
            route.element && (
              <Route
                key={idx}
                path={route.path}
                exact={route.exact}
                name={route.name}
                element={<route.element />}
              />
            )
          )
        })}
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* </Suspense> */}
    </CContainer>
  )
}

export default React.memo(AppContent)
