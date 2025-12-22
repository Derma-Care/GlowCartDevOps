import React from 'react'
import '../CSS/OnboardingStepsCard.css'

export default function OnboardingStepsCard({ setVisible }) {
  const steps = [
    {
      number: '1',
      icon: '🔑',
      title: 'Register Using Code',
      subtitle: 'Enter your unique GlowKart registration code to begin.',
    },
    {
      number: '2',
      icon: '📝',
      title: 'Submit Basic Details',
      subtitle: 'Fill in your name, contact information, and complete profile setup.',
    },
    {
      number: '3',
      icon: '🎡',
      title: 'Spin the Wheel & Win',
      subtitle: 'Play the spin wheel and unlock your exclusive GlowKart reward.',
    },
    {
      number: '4',
      icon: '📸',
      title: 'Share Delivery Address',
      subtitle:
        'Share your reward-winning screenshot and tag us on Instagram [optional], then submit your delivery address.',
    },
  ]

  const colors = ['#ff8ed6', '#ffca78', '#4db7ff', '#53e0d4'] // step colors

  return (
    <div className="steps-wrapper custom-modal" style={{ height: '80vh' }}>
      <div className="header ">
        <div className="d-flex gap-4 justify-content-center align-items-center">
          <span className="star">✨</span>
          <h2>"Early Access" Onboarding</h2>
        </div>

        <button onClick={() => setVisible(false)} className="close-btn  ">
          ✖
        </button>
      </div>

      <div className="steps-flow ">
        {steps.map((step, index) => (
          <div
            key={index}
            className="step-box"
            style={{
              background: colors[index],
              marginLeft: window.innerWidth < 480 ? '0px' : `${index * 50}px`,
            }}
          >
            <div className="step-number-box">
              <span className="step-label">{window.innerWidth < 480 ? 'S' : 'Step-'}</span>
              <span className="step-count">{step.number}</span>
            </div>

            <div className="step-info">
              <div className="step-icon">{window.innerWidth < 480 ? '' : step.icon}</div>

              <div>
                <h4 className="step-title text-dark">{step.title}</h4>
                <p className="step-subtitle text-dark m-1">{step.subtitle}</p>
              </div>
            </div>

            {/* <div className="step-arrow text-dark"></div> */}
          </div>
        ))}
      </div>

      <div className="delivery-box text-center fw-bold">
        🚚{' '}
        <span className="blink-text">
          Your gift will be delivered within 7 days after completion of registration.
        </span>
      </div>
      <div className="onboard-close-btn">
        <button onClick={() => setVisible(false)} className="close-button">
          Close
        </button>
      </div>
    </div>
  )
}
