import React from 'react'
import DermaCareLogo from '../../../assets/images/logoP.png'
import commingSoonLogo from '../../../assets/images/cs.png'
import '../CSS/RegistrationSoon.css'
import { NGK_COLORS } from '../../../Constant/Themes'

export default function RegistrationSoon() {
  return (
    <div className="rs-page">
      {/* TOP RIGHT LOGO (Desktop ONLY) */}
      <div className="rs-top-logo">
        <img src={DermaCareLogo} alt="NGK Logo" />
      </div>

      <div className="rs-wrapper">
        <div className="rs-mobile-logo">
          <img src={DermaCareLogo} alt="NGK Logo" />
        </div>
        {/* IMAGE FOR MOBILE ONLY */}
        <div className="rs-img-mobile">
          <img src={commingSoonLogo} alt="Coming Soon" />
        </div>

        {/* MOBILE LOGO BELOW IMAGE */}

        {/* LEFT CONTENT */}
        <div className="rs-left">
          <h1 className="rs-title">
            REGISTRATIONS <br />
            <span className="rs-bold">OPENING SOON</span>
          </h1>

          <p className="rs-subtitle">
            We’re crafting a glowing experience just for you! <br />
            <br />
            Soon you can register, <b>spin the wheel</b>, and win exclusive Neeha's GlowKart gifts
            &nbsp;
            <strong>
              [Sephora, Charlotte Tilbury, Fenty Beauty, Mac, Benefit, Anastasia Beverly Hills,
              Nykaa, Lakme, Faces Canada, Colour Bar, L'Oréal Paris, Blue Heaven, etc.]
            </strong>
            <br />
            <br />
            Follow us on Instagram and DM us for invitation.
          </p>

          <button
            className="rs-btn"
            onClick={() => window.open('https://www.instagram.com/ngkderma', '_blank')}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/174/174855.png"
              className="rs-btn-icon"
              alt="Instagram"
            />
            Follow on Instagram
          </button>
        </div>

        {/* DESKTOP IMAGE */}
        <div className="rs-img-desktop">
          <img src={commingSoonLogo} alt="Coming Soon" />
        </div>
      </div>
    </div>
  )
}
