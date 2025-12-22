import React from "react";

export default function UserConsentModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="aadhaar-modal-backdrop">
      <div className="aadhaar-modal">
        <h2>User Consent Disclaimer</h2>

        <div className="aadhaar-modal-content">
          <p>
            <b>Neeha’s Glow Kart – Udit CosmeTech Private Limited</b>
            <br /><br />
            <b>Disclaimer:</b>
            <br />
            Neeha’s Glow Kart is a listing and offer-discovery platform only.
            <br />
            We do NOT provide medical treatments.
            <br /><br />
            All dermatology, skin, hair, cosmetic, and aesthetic procedures involve risks.
            <br />
            <b>All treatments are solely the responsibility of the respective clinic/doctor.</b>
            <br /><br />
            By continuing, you agree:
            <br /><br />
            • You visit clinics at your own discretion & risk  <br />
            • NGK is not liable for reactions, side effects, dissatisfaction, or post-treatment issues  <br />
            • You will consult directly with clinics for advice & disputes  <br />
            • NGK only displays offers & information provided by clinics  
          </p>
        </div>

        <button className="aadhaar-close-btn" onClick={onClose}>
          Agree
        </button>
      </div>
    </div>
  );
}
