import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Logo from './header/GlowKaart.png'

import {
  CSidebar,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import './sidebar.css'
import { COLORS } from '../Constant/Themes'

// sidebar nav config
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const location = useLocation() // get current path

  // Hide sidebar only on /clinicRegistration
  if (location.pathname === '/clinic-Registration') return null

  return (
    <CSidebar
      className="border-end"
      style={{ background: 'var(--color-bgcolor)' }}
      color={COLORS.teal}
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <div to="/">
          <div className="d-flex justify-content-center">
            <img
              src={Logo}
              alt="Glowkart Logo"
              style={{ width: '140px', height: '120px', marginBottom: '0px', marginLeft: '30px' }}
            />
          </div>
          <div
            className="d-flex justify-content-center underline-none"
            style={{ marginLeft: '20px' }}
          >
            <h1
              style={{
                fontSize: '30px',
                background: 'linear-gradient(to right, #0072CE, #00AEEF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
              }}
            >
              GlowKart
            </h1>
          </div>
        </div>
      </CSidebarHeader>

      <AppSidebarNav items={navigation} />

      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })} />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
