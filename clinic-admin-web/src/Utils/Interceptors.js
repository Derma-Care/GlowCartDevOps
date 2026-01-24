import axios from 'axios'
import { toast } from 'react-toastify'
import { BASE_URL } from '../baseUrl'
import { showCustomToast } from './Toaster'

/* --------------------- Axios instances --------------------- */
export const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20000,
})

export const httpPublic = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20000,
})

/* --------------------- Toast Control Flag --------------------- */
let isToastActive = false
const showToastOnce = (message) => {
  if (!isToastActive) {
    isToastActive = true
    showCustomToast(message, 'error', 'top-right', {
      onClose: () => {
        // reset when toast closes
        isToastActive = false
      },
    })
  }
}

/* --------------------- Interceptors --------------------- */
export function attachInterceptors(getAuthToken) {
  const reqInterceptor = http.interceptors.request.use(
    (config) => {
      // const token = getAuthToken?.() || localStorage.getItem('token')
      // if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    },
    (error) => Promise.reject(error),
  )

  const resInterceptor = http.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status
      const message = error.response?.data?.message

      // ✅ Check for network errors or server down
      if (error.message === 'Network Error' || !error.response) {
        showToastOnce('🚫 Server unreachable. Please try again later.')
      }
      // ✅ Check for timeout
      else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        showToastOnce('⏱️ Request timed out. Please try again.')
      }
      // ✅ Unauthorized
      else if (status === 401) {
        showToastOnce('🔒 Session expired. Please login again.')
      }
      // ✅ API-specific error message
      else if (message) {
        showCustomToast(message)
      }
      // ✅ Fallback message
      else {
        showToastOnce('❌ Something went wrong. Please try again.')
      }

      return Promise.reject(error)
    },
  )

  // optional cleanup function
  return () => {
    http.interceptors.request.eject(reqInterceptor)
    http.interceptors.response.eject(resInterceptor)
  }
}
