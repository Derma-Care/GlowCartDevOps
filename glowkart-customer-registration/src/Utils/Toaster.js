// // toastUtil.js
// import { toast } from 'react-toastify'
// export const showToast = (msg, type = 'info') => {
//   const options = { toastId: msg, position: 'top-right', autoClose: 4000 }
//   if (type === 'success') toast.success(msg, options)
//   else if (type === 'error') toast.error(msg, options)
//   else if (type === 'warning') toast.warning(msg, options)
//   else toast.info(msg, options)
// }

// components/CustomToast.jsx
import React from 'react'
import { toast } from 'react-toastify'
import '../views/Style/CustomToast.css' // optional for extra styles

import NGKLogo from '../assets/images/logoP.png'

const CustomToast = ({ message, type = 'success' }) => {
  return (
    <div className={`custom-toast ${type}`}>
      <img
        className="profile-image"
        src={NGKLogo}
        alt="Logo"
        style={{
          width: '30px',
          height: '30px',
          marginBottom: '0px',
          backgroundColor: 'white', // 💗 Your pink background
          padding: '4px',
          borderRadius: '10%', // Makes it circular
        }}
      />

      <div className="toast-message">{message}</div>
    </div>
  )
}

export const showCustomToast = (message, type = 'success', position = 'top-right') => {
  const CustomCloseButton = ({ closeToast }) => (
    <span
      onClick={closeToast}
      style={{
        color: 'white',
        fontWeight: 'bold',
        fontSize: '18px',
        marginRight: '10px',
        cursor: 'pointer',
      }}
    >
      ×
    </span>
  )
  toast(<CustomToast message={message} type={type} />, {
    position: position,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    closeButton: CustomCloseButton,
  })
}
