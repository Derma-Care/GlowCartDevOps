import React, { useState } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CButton } from '@coreui/react'

import OnboardingStepsCard from './onboarding_steps_card'
import { NGK_COLORS } from '../../../Constant/Themes'

export default function OnboardingStepsModal() {
  const [visible, setVisible] = useState(false)

  return (
    <>
      {/* Trigger Button */}
      <CButton
        style={{
          color: NGK_COLORS.primary,
          textDecoration: 'underline', // ← correct value
        }}
        className="w-100"
        onClick={() => setVisible(true)}
      >
        View Onboarding Steps
      </CButton>

      {/* CoreUI Modal */}
      <CModal
        size="lg"
        alignment="center"
        visible={visible}
        onClose={() => setVisible(false)}
        backdrop="static"
      >
        <CModalBody>
          <OnboardingStepsCard setVisible={setVisible} />
        </CModalBody>
      </CModal>
    </>
  )
}
