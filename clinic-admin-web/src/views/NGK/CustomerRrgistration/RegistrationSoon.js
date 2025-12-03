import React from 'react'
import DermaCareLogo from '../../../assets/images/logoP.png'
import commingSoonLogo from '../../../assets/images/cs.png'
import { NGK_COLORS } from '../../../Constant/Themes'

export default function RegistrationSoon() {
  return (
    <div style={styles.page}>
      {/* TOP RIGHT LOGO */}
      <div style={styles.topRightLogo}>
        <img src={DermaCareLogo} style={styles.headerLogo} alt="Neeha GlowKart Logo" />
      </div>

      <div style={styles.wrapper}>
        {/* LEFT SIDE */}
        <div style={styles.left}>
          {/* Title */}
          <h1 style={styles.title}>
            REGISTRATIONS <br />
            <span style={styles.bold}>OPENING SOON</span>
          </h1>

          {/* Subtitle */}
          <p style={styles.subtitle}>
            We're crafting a glowing experience just for you! Soon you can soon register,{' '}
            <b>spin the wheel</b>, and win exclusive GlowKart gifts{' '}
            <strong>
              [Sephora, Guerlain, Fenty Beauty, Mac, Benefits, Anastasia Beverly hills, Nykaa,
              Lakme, Faces Canada, Colour Bar, L'Oréal Paris, Blue Heaven, etc..]
            </strong>{' '}
            . Follow us on Instagram and DM us for invitation.
          </p>

          {/* Instagram Button */}
          <button
            className="insta-hover"
            style={styles.instaBtn}
            onClick={() => window.open('https://www.instagram.com/ngkderma', '_blank')}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/174/174855.png"
              style={styles.instaIcon}
              alt="Instagram"
            />
            Follow on Instagram
          </button>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div style={styles.right}>
          <img src={commingSoonLogo} style={styles.heroImage} alt="Coming Soon" />
        </div>
      </div>
    </div>
  )
}

/* ======================= STYLES ======================= */
const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '50px',
    paddingRight: '50px',
    boxSizing: 'border-box',
    position: 'relative',
  },

  /* --- TOP RIGHT LOGO --- */
  topRightLogo: {
    position: 'absolute',
    top: '30px',
    right: '40px',
  },

  headerLogo: {
    width: '120px',
    objectFit: 'contain',
  },

  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1250px',
    gap: '40px',
  },

  /* LEFT SIDE */
  left: {
    flex: 1,
    paddingRight: '20px',
  },

  title: {
    fontSize: '54px',
    fontWeight: 300,
    lineHeight: '1.1',
    color: NGK_COLORS.primary,
    marginBottom: '15px',
  },

  bold: {
    fontSize: '64px',
    fontWeight: 700,
    color: '#e76585ff',
    letterSpacing: '2px',
  },

  subtitle: {
    maxWidth: '520px',
    fontSize: '18px',
    color: '#555',
    lineHeight: '1.7',
    marginTop: '10px',
  },

  /* INSTAGRAM BUTTON */
  instaBtn: {
    marginTop: '40px',
    background: NGK_COLORS.primary,
    border: 'none',
    padding: '16px 22px',
    borderRadius: '14px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 6px 18px rgba(255, 0, 128, 0.25)',
    transition: 'all 0.3s ease',
    animation: 'pulseGlow 2s infinite',
  },

  instaIcon: {
    width: '26px',
    height: '26px',
    backgroundColor: 'white',padding:"2px",borderRadius:"5px"
  },

  /* RIGHT SIDE IMAGE */
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroImage: {
    width: '100%',
    maxWidth: '550px',
    height: 'auto',
    borderRadius: '18px',
    objectFit: 'cover',
  },
}
