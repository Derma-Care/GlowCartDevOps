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
      to: '/package',
      name: 'Employee management',
      as: NavLink,
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    },

    {
      component: CNavItem,
      to: '/Procedure-Management',
      name: 'Procedure Management',
      as: NavLink,
      icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    },

    {
      component: CNavItem,
      to: '/payouts',
      name: 'Payouts',
      as: NavLink,
      icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
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
  return allNav.filter((item) => permissions[item.name] || item.name === 'Patient Management')
}

// ✅ Optional: filter based on permissions if needed
