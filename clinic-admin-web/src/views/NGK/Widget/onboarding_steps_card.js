import React from 'react'
import '../CSS/OnboardingStepsCard.css' // <-- optional if you want clean CSS

export default function OnboardingStepsCard() {
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
      title: 'Upload Winning Proof',
      subtitle: 'Upload winning screenshot, follow Instagram & submit delivery address.',
    },
  ]

  return (
    <div>
      <div className="header">
        <span className="star">✨</span>
        <h2>How Neha’s GlowKart Onboarding Works</h2>
      </div>

      {steps.map((step, index) => (
        <div key={index} className="step-row">
          <div className="step-number">{step.number}</div>

          <div className="step-content">
            <div className="step-icon">{step.icon}</div>

            <div>
              <h4 className="step-title">{step.title}</h4>
              <p className="step-subtitle">{step.subtitle}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="delivery-box justify-content-center text-center fw-bold">
        🚚 <span>Your gift will be delivered within 7 days after completion.</span>
      </div>
    </div>
  )
}
