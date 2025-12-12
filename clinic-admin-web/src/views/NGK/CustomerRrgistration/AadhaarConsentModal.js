import React from "react";

export default function AadhaarConsentModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="aadhaar-modal-backdrop text-black">
      <div className="aadhaar-modal">
        <h2>Aadhaar Consent Notice</h2>

        <div className="aadhaar-modal-content">
          <p>
            Udit CosmeTech Private Limited (“we”, “us”, “our”), the operator of the
            mobile application Neeha’s Glow Kart, is committed to protecting your
            personal data in accordance with the Digital Personal Data Protection Act,
            2023 (DPDP Act).
            <br /><br />
            To ensure genuine, unique, and non-duplicate registrations, we request you
            to voluntarily provide your Aadhaar Number for identity verification and
            fraud-prevention purposes.
            <br /><br />
            <b>1. Purpose of Collecting Your Aadhaar Number</b>
            <br /><br />
            • To ensure unique and genuine customer registration  <br />
            • To prevent fraudulent sign-ups or misuse of rewards  <br />
            • To maintain authenticity of users  
            <br /><br />
            <b>We do NOT use Aadhaar for:</b>
            <br />
            • Marketing  <br />
            • Profiling  <br />
            • Sharing with clinics or external agencies  <br />
            • Any purpose beyond identity uniqueness verification  
            <br /><br />
            <b>2. How Your Aadhaar Information Is Handled</b>
            <br /><br />
            • Aadhaar is NOT stored in plain text  <br />
            • It is converted immediately into a secure one-way cryptographic hash (SHA-256)  <br />
            • Only the hashed value is stored  <br />
            • Original Aadhaar is discarded immediately  
            <br /><br />
            <b>3. Voluntary Consent</b>
            <br /><br />
            Providing Aadhaar is voluntary but required to access:
            <br />
            • Registration via invite  <br />
            • Eligibility for spin wheel rewards  <br />
            • Fraud-free participation  
            <br /><br />
            <b>4. Your Rights Under DPDP Act</b>
            <br /><br />
            • Withdraw consent anytime  <br />
            • Request deletion of hashed identifier  <br />
            • Request processing details  
            <br />
            Email: <a href="mailto:support@ngkderma.com">support@ngkderma.com</a>
            <br /><br />
            <b>Data Protection Officer (DPO):</b>
            <br />
            Email: support@uditcosmetech.com  <br />
            Address: Udit CosmeTech Private Limited, Coimbatore, Tamil Nadu - 641035  
            <br /><br />
            <b>5. Retention & Deletion Policy</b>
            <br />
            Only hashed Aadhaar is retained as long as required.
            <br /><br />
            <b>6. By Proceeding, You Consent That:</b>
            <br />
            • You voluntarily provide Aadhaar  <br />
            • You understand its limited purpose  <br />
            • You agree to secure hashing & processing  <br />
            • You authorize Udit CosmeTech Private Limited to process your data  
          </p>
        </div>

        <button className="aadhaar-close-btn" onClick={onClose}>
          Agree
        </button>
      </div>
    </div>
  );
}
