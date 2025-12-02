import React from 'react'
import CIcon from '@coreui/icons-react'
import { CNavItem } from '@coreui/react'
import {
  cilUser,
  cilHospital,
  cilList,
  cilGift,
  cilGroup,
  cilBullhorn,
  cilBell,
  cilWallet,
  cilTask,
  cibGoogleAds,
} from '@coreui/icons'

const _nav = [
  {
    component: CNavItem,
    name: 'Clinic Management',
    to: '/clinic-management',
    icon: <CIcon icon={cilHospital} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Customer Management',
    to: '/customer-management',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Procedure Management',
    to: '/procedure-management',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Packages & Procedures',
    to: '/package-management',
    icon: <CIcon icon={cilGift} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Membership Management',
    to: '/membership-management',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Ads Management',
    to: '/ads-management',
    icon: <CIcon icon={cibGoogleAds} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Push Notifications',
    to: '/push-notifications',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Payouts',
    to: '/payouts',
    icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
  },

  // ✅ Added Registration Codes
  {
    component: CNavItem,
    name: 'Registration Codes',
    to: '/registration-codes',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },
]

export default _nav
