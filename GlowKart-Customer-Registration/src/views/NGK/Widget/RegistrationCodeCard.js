import React from "react";
import { CFormInput, CButton } from "@coreui/react";
import OnboardingStepsModal from "./OnboardingStepsModal";

export default function RegistrationCodeCard({
  form,
  error,
  isRegistration,
  verifyLoading,
  handleRefChange,
  handleSubmitReferralCode,
}) {
  return (
    <div
      style={{
        width: 360,
        background: "#fff",
        padding: "26px 26px 35px",
        borderRadius: 20,
        boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        border: "1px solid #f1d7ff",
        position: "relative",
      }}
    >
      {/* Header Gradient Strip */}
      <div
        style={{
          height: 65,
          borderRadius: "16px 16px 0 0",
          margin: "-26px -26px 20px -26px",
          background:
            "linear-gradient(135deg, #e53ae8 0%, #b26ad8 50%, #8b43d1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: 19,
          letterSpacing: 0.3,
        }}
      >
        Enter Registration Code
      </div>

      {/* Input Box */}
      <CFormInput
        name="registraionCode"
        value={form.registraionCode}
        onChange={handleRefChange}
        placeholder="Enter your code"
        style={{
          borderRadius: 12,
          height: 48,
          marginTop: 10,
          textTransform: "uppercase",
          fontWeight: 600,
          letterSpacing: 1.2,
          border: "1.5px solid #d3b6ff",
        }}
      />

      {/* Error message */}
      {error && (
        <p
          style={{
            color: "#ff2e85",
            fontSize: 14,
            fontWeight: 600,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}

      {/* Submit Button */}
      <CButton
        type="button"
        color="primary"
        style={{
          marginTop: 25,
          width: "75%",
          margin: "0 auto",
          display: "block",
          borderRadius: 12,
          fontWeight: "700",
          fontSize: 16,
          padding: "12px 0",
          background: isRegistration
            ? "linear-gradient(90deg, #e33de9ff, #b26ad8)"
            : "#c5bdd6",
          border: "none",
          cursor: isRegistration ? "pointer" : "not-allowed",
          boxShadow: isRegistration
            ? "0 4px 14px rgba(106,90,224,0.35)"
            : "none",
          transition: "0.25s",
        }}
        onClick={handleSubmitReferralCode}
        disabled={!isRegistration || verifyLoading}
      >
        {verifyLoading ? "Verifying..." : "Submit Code"}
      </CButton>

      {/* Onboarding Steps */}
      <div style={{ marginTop: 18, textAlign: "center" }}>
        <OnboardingStepsModal />
      </div>

      {/* Footer Message */}
      <p
        style={{
          marginTop: 12,
          fontSize: 13,
          textAlign: "center",
          color: "#999",
        }}
      >
        🎁 Unlock your exclusive GlowKart gift after completing onboarding!
      </p>
    </div>
  );
}
