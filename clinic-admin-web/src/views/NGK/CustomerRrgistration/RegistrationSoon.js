import React from 'react'
import DermaCareLogo from '../../../assets/images/logoP.png'
import commingSoonLogo from '../../../assets/images/cs.png'
import { NGK_COLORS } from '../../../Constant/Themes'

export default function RegistrationSoon() {
  return (
    <>
      {/* 🔥 Responsive Styles for Mobile */}
      <style>
        {`
          /* ================= MOBILE VIEW FIX (max-width: 768px) ================= */
          @media (max-width: 768px) {

            .wrapper {
              flex-direction: column !important;
              text-align: center !important;
              gap: 25px !important;
              padding: 20px !important;
            }

            /* Logo centered */
            .top-logo {
            display:none;
              margin: 10px auto !important;
               text-align: center !important;
              
            }
            .top-logo img {
              width: 110px !important;
            }

            /* Image first */
            .right-side {
              order: 1;
              width: 100%;
              display: flex;
              justify-content: center;
            }
            .right-side img {
              width: 90% !important;
              max-width: 340px !important;
            }

            /* Content after image */
            .left-side {
              order: 2;
              padding: 0 !important;
            }

            .title {
              font-size: 34px !important;
              line-height: 1.2 !important;
              margin-top: 10px;
            }

            .bold {
              font-size: 40px !important;
            }

            .subtitle {
              font-size: 16px !important;
              width: 100% !important;
            }

            /* Button full width */
            .insta-btn {
              width: 100% !important;
              max-width: 360px !important;
              margin: 25px auto 0 auto !important;
              justify-content: center !important;
              display: flex !important;
            }
          }
        `}
      </style>

      {/* PAGE */}
      <div style={styles.page}>
        {/* TOP RIGHT LOGO */}
        <div style={styles.topRightLogo} className="top-logo">
          <img src={DermaCareLogo} style={styles.headerLogo} alt="Neeha GlowKart Logo" />
        </div>

        <div style={styles.wrapper} className="wrapper">
          {/* LEFT SIDE CONTENT */}
          <div style={styles.left} className="left-side">
            <h1 style={styles.title} className="title">
              REGISTRATIONS <br />
              <span style={styles.bold} className="bold">
                OPENING SOON
              </span>
            </h1>

            <p style={styles.subtitle} className="subtitle">
              We're crafting a glowing experience just for you! <br />
              <br />
              Soon you can register, <b>spin the wheel</b>, and win exclusive GlowKart gifts &nbsp;
              <strong>
                [Sephora, Charlotte Tilbury, Fenty Beauty, Mac, Benefits, Anastasia Beverly Hills,
                Nykaa, Lakme, Faces Canada, Colour Bar, L'Oréal Paris, Blue Heaven, etc.]
              </strong>
              <br />
              <br />
              Follow us on Instagram and DM us for invitation.
            </p>

            <button
              style={styles.instaBtn}
              className="insta-btn"
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
          <div style={styles.right} className="right-side">
            <img src={commingSoonLogo} style={styles.heroImage} alt="Coming Soon" />
          </div>
        </div>
      </div>
    </>
  )
}

/* ======================= BASE STYLES (DESKTOP) ======================= */
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
    backgroundColor: 'white',
    padding: '2px',
    borderRadius: '5px',
  },

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
