import React from "react";
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CButton,
  CRow,
  CCol,
} from "@coreui/react";
import Select from "react-select";

export default function RegistrationFormScreen({
  form,
  setForm,
  errors,
  setErrors,
  inputRefs,
  cityList,
  handleChange,
  eighteenYearsAgoISO,
  NGK_COLORS,
  indianSkinTones,
  handleServiceStatusSelect,
  serviceStatusError,
  serviceStatusRef,
  maxToday,
  minDate12Months,
  procedureOptions,
  handleProcedureChange,
  showOtherInput,
  setFormField = () => {},
  updateForm,
  processFile,
  UploadedPreview,
  loading,
  handleSubmit,
  setShowConsentModal,
  setShowAadhaarModal,
  setServiceStatusError,
}) {
  return (
    <CForm onSubmit={handleSubmit}>
      <>
        {/* HEADER */}
        <div className="header-container">
          <div className="justify-content-start align-items-center d-flex flex-column">
            <img
              src={form.logo}
              alt="logo"
              style={{
                height: 100,
                borderRadius: 12,
                objectFit: "fill",
              }}
            />

            <h4 className="m-0 fw-bold text-center w-100 gradient-text">
              Registration
            </h4>
          </div>
        </div>

        <CRow className="g-4 mt-4">
          {/* FULL NAME */}
          <CCol md={6}>
            <CFormLabel className="label-gradient" style={{ color: NGK_COLORS.primarySoft }}>
              Full Name (As Per Aadhaar Card) <span className="text-danger">*</span>
            </CFormLabel>

            <CFormInput
              ref={inputRefs.fullName}
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter Full Name"
            />

            {errors.fullName && <p style={{ color: "#ff2e85" }}>{errors.fullName}</p>}
          </CCol>

          {/* MOBILE */}
          <CCol md={6}>
            <CFormLabel className="label-gradient" style={{ color: NGK_COLORS.primarySoft }}>
              Mobile Number <span className="text-danger">*</span>
            </CFormLabel>

            <CFormInput
              ref={inputRefs.mobile}
              name="mobile"
              maxLength={10}
              placeholder="Enter Mobile Number"
              inputMode="numeric"
              value={form.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                handleChange({ target: { name: "mobile", value } });
              }}
            />

            {errors.mobile && <p style={{ color: "#ff2e85" }}>{errors.mobile}</p>}
          </CCol>

          {/* GENDER */}
          <CCol md={6}>
            <CFormLabel className="label-gradient" style={{ color: NGK_COLORS.primarySoft }}>
              Gender
            </CFormLabel>

            <CFormSelect
              name="gender"
              value={form.gender}
              onChange={handleChange}
              ref={inputRefs.gender}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </CFormSelect>

            {errors.gender && <p style={{ color: "#ff2e85" }}>{errors.gender}</p>}
          </CCol>

          {/* DOB */}
          <CCol md={6}>
            <CFormLabel className="label-gradient" style={{ color: NGK_COLORS.primarySoft }}>
              Date of birth <span className="text-danger">*</span>
            </CFormLabel>

            <CFormInput
              ref={inputRefs.dob}
              type="date"
              name="dob"
              value={form.dob}
              max={eighteenYearsAgoISO}
              onChange={handleChange}
            />

            {errors.dob && <p style={{ color: "#ff2e85" }}>{errors.dob}</p>}
          </CCol>

          {/* CITY */}
          <CCol md={6}>
            <CFormLabel className="label-gradient" style={{ color: NGK_COLORS.primarySoft }}>
              City <span className="text-danger">*</span>
            </CFormLabel>

            <Select
              name="city"
              ref={inputRefs.city}
              value={form.city ? { label: form.city, value: form.city } : null}
              onChange={(selected) => {
                handleChange({ target: { name: "city", value: selected?.value || "" } });
              }}
              options={[
                ...cityList.map((city) => ({ label: city, value: city })),
                { label: "Other", value: "other" },
              ]}
              placeholder="Select or Search City"
              isSearchable
            />

            {form.city === "other" && (
              <CFormInput
                className="mt-2"
                placeholder="Enter City"
                value={form.otherCity || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, otherCity: e.target.value }))
                }
              />
            )}

            {errors.city && <p style={{ color: "#ff2e85" }}>{errors.city}</p>}
          </CCol>

          {/* AADHAAR */}
          <CCol md={6}>
            <CFormLabel className="label-gradient" style={{ color: NGK_COLORS.primarySoft }}>
              Aadhaar Card Number <span className="text-danger">*</span>
            </CFormLabel>

            <CFormInput
              ref={inputRefs.Aadhar}
              name="Aadhar"
              placeholder="Enter 12-digit Aadhaar number"
              maxLength={12}
              inputMode="numeric"
              value={form.Aadhar}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                handleChange({ target: { name: "Aadhar", value } });
              }}
            />

            {errors.Aadhar && <p style={{ color: "#ff2e85" }}>{errors.Aadhar}</p>}
          </CCol>

          {/* USER CONSENT CHECKBOX */}
          <CCol md={12}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <input
                type="checkbox"
                checked={form.userConsent}
                disabled={form.userConsent}
                onChange={(e) => {
                  setForm({ ...form, userConsent: e.target.checked });
                  if (e.target.checked) {
                    setErrors((prev) => ({ ...prev, userConsent: "" }));
                    setServiceStatusError("");
                  }
                }}
                style={{ width: 15, height: 15, accentColor: NGK_COLORS.primary }}
              />

              <div style={{ fontSize: 16, color: "#555" }}>
                I agree to the{" "}
                <span
                  onClick={() => setShowConsentModal(true)}
                  style={{
                    color: NGK_COLORS.primary,
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  User Consent Disclaimer
                </span>
                .
              </div>
            </div>

            {errors.userConsent && (
              <p style={{ color: NGK_COLORS.primary }}>{errors.userConsent}</p>
            )}
          </CCol>

          {/* PRIVACY POLICY CHECKBOX */}
          <CCol md={12}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <input
                type="checkbox"
                checked={form.privacyConsent}
                disabled={form.privacyConsent}
                onChange={(e) => {
                  setForm({ ...form, privacyConsent: e.target.checked });
                  if (e.target.checked)
                    setErrors((prev) => ({ ...prev, privacyConsent: "" }));
                }}
                style={{ width: 15, height: 15, accentColor: NGK_COLORS.primary }}
              />

              <label style={{ fontSize: 16, color: "#555" }}>
                I have read and understood{" "}
                <a
                  href="/pdf/privacy-policy.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: NGK_COLORS.primary,
                    textDecoration: "underline",
                    fontWeight: 600,
                  }}
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            {errors.privacyConsent && (
              <p style={{ color: "#ff2e85", fontSize: 13 }}>{errors.privacyConsent}</p>
            )}
          </CCol>

          {/* AADHAAR CONSENT */}
          <CCol md={12}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <input
                type="checkbox"
                checked={form.aadhaarConsent}
                disabled={form.aadhaarConsent}
                onChange={(e) => {
                  setForm({ ...form, aadhaarConsent: e.target.checked });
                  if (e.target.checked)
                    setErrors((prev) => ({ ...prev, aadhaarConsent: "" }));
                }}
                style={{ width: 15, height: 15, accentColor: NGK_COLORS.primary }}
              />

              <div style={{ fontSize: 15, color: "#555" }}>
                <strong style={{ color: NGK_COLORS.primary }}>Aadhaar Consent:</strong>
                <p style={{ marginTop: 6, color: NGK_COLORS.primarySoft }}>
                  <strong>{form.fullName}</strong>, I agree to Aadhaar-based verification and
                  understand the{" "}
                  <span
                    className="aadhaar-link"
                    onClick={() => setShowAadhaarModal(true)}
                  >
                    Aadhaar Consent Notice
                  </span>
                  .
                </p>
              </div>
            </div>

            {errors.aadhaarConsent && (
              <p style={{ color: "#ff2e85", fontSize: 13 }}>{errors.aadhaarConsent}</p>
            )}
          </CCol>

          {/* SERVICE STATUS QUESTION */}
          <CCol md={12} ref={serviceStatusRef}>
            <div className="d-flex justify-content-between" style={{ color: NGK_COLORS.primarySoft }}>
              <CFormLabel>
                Have you taken any dermatology related service in the last 12 months?
              </CFormLabel>
            </div>

            <div className="d-flex justify-content-center" style={{ gap: 20 }}>
              <CButton
                style={{
                  backgroundColor:
                    form.serviceStatus === "1" ? NGK_COLORS.primary : "#e4e4e4",
                  color: form.serviceStatus === "1" ? "#fff" : "#444",
                }}
                onClick={() => handleServiceStatusSelect("1")}
              >
                Yes
              </CButton>

              <CButton
                style={{
                  backgroundColor:
                    form.serviceStatus === "2" ? NGK_COLORS.primary : "#e4e4e4",
                  color: form.serviceStatus === "2" ? "#fff" : "#444",
                }}
                onClick={() => handleServiceStatusSelect("2")}
              >
                No, I'm Interested
              </CButton>
            </div>

            {serviceStatusError && (
              <p style={{ color: "#ff2e85" }}>{serviceStatusError}</p>
            )}
          </CCol>

          {/* CONDITIONAL SECTION — SERVICE HISTORY FORM */}
          {form.serviceStatus === "1" && (
            <>
              <CCol md={6}>
                <CFormLabel style={{ color: NGK_COLORS.primarySoft }}>
                  Clinic Name <span className="text-danger">*</span>
                </CFormLabel>

                <CFormInput
                  ref={inputRefs.clinicName}
                  name="clinicName"
                  value={form.clinicName}
                  onChange={handleChange}
                />

                {errors.clinicName && (
                  <p style={{ color: "#ff2e85" }}>{errors.clinicName}</p>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel style={{ color: NGK_COLORS.primarySoft }}>
                  Clinic Area Pincode <span className="text-danger">*</span>
                </CFormLabel>

                <CFormInput
                  ref={inputRefs.clinicCityArea}
                  name="clinicCityArea"
                  value={form.clinicCityArea}
                  maxLength={6}
                  inputMode="numeric"
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 6) value = value.slice(0, 6);
                    handleChange({ target: { name: "clinicCityArea", value } });
                  }}
                />

                {errors.clinicCityArea && (
                  <p style={{ color: "#ff2e85" }}>{errors.clinicCityArea}</p>
                )}
              </CCol>

              {/* LAST VISIT DATE */}
              <CCol md={6}>
                <CFormLabel style={{ color: NGK_COLORS.primarySoft }}>
                  Last Visit Date <span className="text-danger">*</span>
                </CFormLabel>

                <CFormInput
                  ref={inputRefs.dateOfLastVisit}
                  type="date"
                  name="dateOfLastVisit"
                  max={maxToday}
                  min={minDate12Months}
                  value={form.dateOfLastVisit}
                  onChange={handleChange}
                />

                {errors.dateOfLastVisit && (
                  <p style={{ color: "#ff2e85" }}>{errors.dateOfLastVisit}</p>
                )}
              </CCol>

              {/* SERVICES AVAILED */}
              <CCol md={6}>
                <CFormLabel style={{ color: NGK_COLORS.primarySoft }}>
                  Service Availed <span className="text-danger">*</span>
                </CFormLabel>

                <Select
                  isMulti
                  options={procedureOptions}
                  value={procedureOptions.filter(
                    (opt) =>
                      form.serviceType?.includes(opt.label) ||
                      (opt.value === "other" && form.serviceType.includes("other"))
                  )}
                  onChange={handleProcedureChange}
                />

                {errors.serviceType && (
                  <p style={{ color: "#ff2e85" }}>{errors.serviceType}</p>
                )}

                {showOtherInput && (
                  <CFormInput
                    className="mt-2"
                    placeholder="Specify Other Service"
                    value={form.otherServiceName || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        otherServiceName: e.target.value,
                      }))
                    }
                  />
                )}
              </CCol>

              {/* RECEIPT UPLOAD */}
              <CCol md={12}>
                <CFormLabel style={{ color: NGK_COLORS.primarySoft }}>
                  Upload your last visit receipt <span className="text-danger">*</span>
                </CFormLabel>

                <label
                  style={{
                    border: `2px dashed ${NGK_COLORS.primaryLight}`,
                    borderRadius: 12,
                    padding: 18,
                    width: "100%",
                    textAlign: "center",
                    cursor: "pointer",
                    color: NGK_COLORS.primary,
                    fontWeight: "500",
                  }}
                >
                  📁 Tap to upload receipt
                  <input
                    type="file"
                    accept="image/*, application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const base64 = await processFile(file);
                      updateForm("prescription", base64);
                    }}
                    style={{ display: "none" }}
                  />
                </label>

                <UploadedPreview src={form.prescription} />

                {errors.prescription && (
                  <p style={{ color: "#ff2e85" }}>{errors.prescription}</p>
                )}
              </CCol>
            </>
          )}

          {/* INTEREST SECTION */}
          {form.serviceStatus === "2" && (
            <>
              <CCol md={6}>
                <CFormLabel style={{ color: NGK_COLORS.primarySoft }}>
                  Select Category <span className="text-danger">*</span>
                </CFormLabel>

                <CFormSelect
                  name="interestCategory"
                  value={form.interestCategory}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="Skin">Skin</option>
                  <option value="Hair">Hair</option>
                  <option value="Laser">Laser</option>
                  <option value="Body">Body</option>
                  <option value="Other">Other</option>
                </CFormSelect>

                {errors.interestCategory && (
                  <p style={{ color: "#ff2e85" }}>{errors.interestCategory}</p>
                )}
              </CCol>

              <CCol md={6}>
                <CFormLabel style={{ color: NGK_COLORS.primarySoft }}>
                  Your Concern / Procedure <span className="text-danger">*</span>
                </CFormLabel>

                <Select
                  isMulti
                  placeholder="Select your concerns..."
                  options={[
                    ...procedureOptions.filter(
                      (op) => op.label.toLowerCase() !== "others"
                    ),
                    { value: "other", label: "Others" },
                  ]}
                  value={[
                    ...procedureOptions.filter((opt) =>
                      form.problemDescription?.includes(opt.label)
                    ),
                    ...(form.problemDescription?.includes("other")
                      ? [{ value: "other", label: "Others" }]
                      : []),
                  ]}
                  onChange={(selected) => {
                    const labels = selected.map((item) =>
                      item.value === "other" ? "other" : item.label
                    );

                    setForm((prev) => ({
                      ...prev,
                      problemDescription: labels,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      problemDescription: "",
                    }));
                  }}
                />

                {errors.problemDescription && (
                  <p style={{ color: "#ff2e85" }}>{errors.problemDescription}</p>
                )}

                {form.problemDescription?.includes("other") && (
                  <CFormInput
                    className="mt-2"
                    placeholder="Specify Other Concern"
                    value={form.otherServiceName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        otherServiceName: e.target.value,
                      }))
                    }
                  />
                )}
              </CCol>

              {/* SKIN TONE */}
              <CCol md={6}>
                <CFormLabel style={{ color: NGK_COLORS.primarySoft }}>
                  Your Skin Tone <span className="text-danger">*</span>
                </CFormLabel>

                <CFormSelect
                  name="skinTone"
                  value={form.skinTone}
                  onChange={handleChange}
                >
                  <option value="">Select Skin Tone</option>
                  {indianSkinTones.map((tone) => (
                    <option key={tone.value} value={tone.value}>
                      {tone.label}
                    </option>
                  ))}
                </CFormSelect>

                {errors.skinTone && (
                  <p style={{ color: "#ff2e85" }}>{errors.skinTone}</p>
                )}

                {form.skinTone === "other" && (
                  <CFormInput
                    className="mt-2"
                    placeholder="Specify Other Skin Tone"
                    value={form.skinToneOther}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        skinToneOther: e.target.value,
                      }))
                    }
                  />
                )}
              </CCol>

              {/* OPTIONAL PHOTO */}
              <CCol md={6}>
                <CFormLabel style={{ color: NGK_COLORS.primarySoft }}>
                  Upload Photo (Optional)
                </CFormLabel>

                <label
                  style={{
                    border: "2px dashed #ff95c9",
                    borderRadius: 12,
                    padding: 18,
                    width: "100%",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#fff8fc",
                    color: "#ff2e85",
                    fontWeight: 500,
                  }}
                >
                  📁 Upload Photo
                  <input
                    type="file"
                    accept="image/*, application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const base64 = await processFile(file);
                      updateForm("samplePhoto", base64);
                    }}
                    style={{ display: "none" }}
                  />
                </label>

                {form.samplePhoto && <UploadedPreview src={form.samplePhoto} />}

                {errors.samplePhoto && (
                  <p style={{ color: "#ff2e85" }}>{errors.samplePhoto}</p>
                )}
              </CCol>
            </>
          )}

          {/* SUBMIT BUTTON */}
          {form.serviceStatus && (
            <CCol md={12} className="mt-5 d-flex justify-content-end">
              <CButton style={{ background: NGK_COLORS.primary, color: "#fff" }} type="submit">
                {loading ? "Submitting..." : "Submit"}
              </CButton>
            </CCol>
          )}
        </CRow>
      </>
    </CForm>
  );
}
