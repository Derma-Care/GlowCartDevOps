import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilSpeedometer,
  cilUser,
  cilWarning,
  cilClipboard,
  cilHealing,
  cilSettings,
  cilDescription,
  cilTablet,
  cilNoteAdd,
  cilNotes,
  cilWallet,
  cilLightbulb,
  cilBell,
  cilPeople,
  cilCreditCard,
  cilStorage,
  cilGift,
  cilTask,
  cilStar,
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'
import { NavLink } from 'react-router-dom'

export const getNavigation = (permissions = {}) => {
  const allNav = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      as: NavLink,
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    },
    // {
    //   component: CNavItem,
    //   name: 'Appointments',
    //   to: '/Appointment-Management',
    //   as: NavLink,
    //   icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    // },

    {
      component: CNavItem,
      to: '/procedure',
      name: 'Procedure Management',
      as: NavLink,
      icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/package',
      name: 'Package Management',
      as: NavLink,
      icon: <CIcon icon={cilGift} customClassName="nav-icon" />,
    },
    // {
    //   component: CNavItem,
    //   to: '/membership',
    //   name: 'Membership',
    //   as: NavLink,
    //   icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
    // },

    {
      component: CNavItem,
      to: '/reviews',
      name: 'Reviews & Ratings',
      as: NavLink,
      icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    },

    {
      component: CNavItem,
      name: 'Payouts',
      to: '/payouts',
      as: NavLink,

      // fake route, only for active highlighting to work correctly
      icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,

      onClick: (e) => {
        e.preventDefault() // prevent navigation
        window.dispatchEvent(new Event('openPayoutAuth'))
      },
    },

    {
      component: CNavItem,
      to: '/help',
      name: 'Help',
      as: NavLink,
      icon: <CIcon icon={cilLightbulb} customClassName="nav-icon" />,
    },
  ]

  // // Only include items if permission exists
  if (!permissions || typeof permissions !== 'object') return []

  // return allNav.filter((item) => permissions[item.name])
  // return allNav.filter((item) => permissions[item.name])
  return allNav.filter((item) => (!permissions || !permissions[item.name] ? false : true))
}

// ✅ Optional: filter based on permissions if needed
