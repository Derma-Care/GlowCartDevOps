import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import './App.css'
import store from './store'

 
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { attachInterceptors } from './Utils/Interceptors' // <-- interceptor file
import './views/Style/toastify.css'

import { BrowserRouter } from 'react-router-dom'
import NGlowKartPatientRegistration_CoreUI from './views/NGK/CustomerRrgistration/CustomerRegistration'
import PrizePostDetails from './views/NGK/CustomerRrgistration/PrizePostDetails'
import OnboardSuccess from './views/NGK/CustomerRrgistration/OnboardSuccess'
function Root() {
  // attach interceptors once when app mounts
  // useEffect(() => {
  //   const detach = attachInterceptors(() => localStorage.getItem('token'))
  //   return () => detach()
  // }, [])
  useEffect(() => {
    const detach = attachInterceptors()
    return () => detach()
  }, [])

  return (
    <Provider store={store}>
      <BrowserRouter>
        
        
           
        
              <ToastContainer
                position="top-right"
                limit={3}
                theme="dark" // base dark theme
                toastStyle={{
                  backgroundColor: 'var(--color-black)',
                  color: 'white',
                }}
              />
              <App />
           
     
      
      </BrowserRouter>
    </Provider>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
