import axios from 'axios'
import { toast } from 'react-toastify'
import { BASE_URL, wifiUrl } from '../baseUrl'
import { showCustomToast } from './Toaster'

/* --------------------- Axios instances --------------------- */
export const http = axios.create({
  baseURL: wifiUrl,
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
      const currentPath = window.location.pathname

      // ❌ Network issues (global)
      if (!error.response) {
        showToastOnce('🚫 Server unreachable. Please try again later.')
      }

      // ❌ Timeout
      else if (error.code === 'ECONNABORTED') {
        showToastOnce('⏱️ Request timed out. Please try again.')
      }

      // 🔒 401 — ONLY redirect if NOT on login page
      else if (status === 401 && currentPath !== '/login') {
        showToastOnce('🔒 Session expired. Please login again.')
        localStorage.clear()
        window.location.href = '/login'
      }

      // ✅ Let login page handle its own errors
      return Promise.reject(error)
    },
  )

  // optional cleanup function
  return () => {
    http.interceptors.request.eject(reqInterceptor)
    http.interceptors.response.eject(resInterceptor)
  }
}
