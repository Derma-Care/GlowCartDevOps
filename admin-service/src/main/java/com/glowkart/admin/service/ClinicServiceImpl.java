package com.glowkart.admin.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.glowkart.admin.client.OnboardingClient;
import com.glowkart.admin.dto.*;
import com.glowkart.admin.exception.ProcedureServiceException;
import com.glowkart.admin.model.Clinic;
import com.glowkart.admin.model.Doctor;
import com.glowkart.admin.repo.ClinicRepository;
import com.glowkart.admin.util.CredentialGenerator;
import com.glowkart.admin.util.PermissionsUtil;

@Service
public class ClinicServiceImpl implements ClinicService {

    private final ClinicRepository repo;
    private final OnboardingClient onboardingClient;
    private final AsyncVerificationService asyncVerificationService;

    private static final String CLINIC_PASSWORD_RESET = "CLINIC_PASSWORD_RESET";
    private static final String PAYOUT_PASSWORD_RESET = "PAYOUT_PASSWORD_RESET";

    public ClinicServiceImpl(
            ClinicRepository repo,
            OnboardingClient onboardingClient,
            AsyncVerificationService asyncVerificationService) {

        this.repo = repo;
        this.onboardingClient = onboardingClient;
        this.asyncVerificationService = asyncVerificationService;
    }

    // ==========================================================================================
    // REGISTER CLINIC
    // ==========================================================================================
    @Override
    public Clinic registerClinic(ClinicRegistrationDTO dto) {

        Map<String, Object> tokenInfo = onboardingClient.verifyToken(dto.getToken());
        if (tokenInfo == null) {
            throw new ProcedureServiceException("Invalid or expired onboarding token", 400, null);
        }

        String tokenWhatsapp = (String) tokenInfo.get("whatsappNumber");
        String tokenEmail = (String) tokenInfo.get("email");

        Clinic clinic = new Clinic();
        copyBasicFields(dto, clinic);

        clinic.setWhatsappNumber(dto.getWhatsappNumber() != null ? dto.getWhatsappNumber() : tokenWhatsapp);
        clinic.setEmail(dto.getEmail() != null ? dto.getEmail() : tokenEmail);
        clinic.setRole(dto.getRole() != null ? dto.getRole() : "ADMIN");
        clinic.setPermissions(dto.getPermissions() != null ? dto.getPermissions() : PermissionsUtil.getAdminPermissions());

        decodeDocuments(dto, clinic);

     // Generate login credentials
        Map<String, String> credentials = CredentialGenerator.generateLoginCredentials();
        clinic.setUsername(credentials.get("username"));
        clinic.setPassword(credentials.get("password")); // PLAIN TEXT PASSWORD

        // Generate payout credentials
        Map<String, String> payoutCredentials = CredentialGenerator.generatePayoutCredentials();
        clinic.setPayoutUsername(payoutCredentials.get("payoutUsername"));
        clinic.setPayoutPassword(payoutCredentials.get("payoutPassword"));

        
        clinic.setStatus("PENDING");
        clinic.setCreatedAt(Instant.now());

        Clinic saved = repo.save(clinic);

        onboardingClient.markUsed(Map.of("token", dto.getToken()));
        asyncVerificationService.sendAcknowledgementAsync(saved);

        return saved;
    }

    // ==========================================================================================
    // VERIFICATION WORKFLOW
    // ==========================================================================================
    @Override
    public Clinic startVerificationProcess(String clinicId) {
        Clinic clinic = findClinic(clinicId);
        clinic.setStatus("VERIFICATION_IN_PROGRESS");
        repo.save(clinic);
        asyncVerificationService.sendVerificationStartedAsync(clinic);
        return clinic;
    }

    @Override
    public Clinic verifyClinic(String clinicId) {
        Clinic clinic = findClinic(clinicId);
        clinic.setStatus("VERIFIED");

        // Generate login credentials if missing
        if (clinic.getUsername() == null || clinic.getPassword() == null) {
            Map<String, String> creds = CredentialGenerator.generateLoginCredentials();
            clinic.setUsername(creds.get("username"));
            clinic.setPassword(creds.get("password"));
        }

        // Generate payout credentials if missing
        if (clinic.getPayoutUsername() == null || clinic.getPayoutPassword() == null) {
            Map<String, String> payoutCreds = CredentialGenerator.generatePayoutCredentials();
            clinic.setPayoutUsername(payoutCreds.get("payoutUsername"));
            clinic.setPayoutPassword(payoutCreds.get("payoutPassword"));
        }
        
        
        repo.save(clinic);
        asyncVerificationService.sendCredentialsAsync(clinic);
        return clinic;
    }

    @Override
    public Clinic rejectClinic(String clinicId, String reason) {
        Clinic clinic = findClinic(clinicId);
        clinic.setStatus("REJECTED");
        repo.save(clinic);
        asyncVerificationService.sendRejectionNotificationAsync(clinic, reason);
        return clinic;
    }

    // ==========================================================================================
    // CRUD
    // ==========================================================================================
    @Override
    public List<Clinic> getAll() {
        return repo.findAll();
    }

    @Override
    public Clinic getById(String clinicId) {
        return findClinic(clinicId);
    }

    @Override
    public void deleteClinic(String clinicId) {
        if (!repo.existsById(clinicId)) {
            throw new ProcedureServiceException("Clinic not found", 404, null);
        }
        repo.deleteById(clinicId);
    }

    @Override
    public List<Clinic> getVerifiedClinics() {
        return repo.findByStatusIgnoreCase("VERIFIED");
    }

   

    // ==========================================================================================
    // UPDATE CLINIC (FULL LOGIC)
    // ==========================================================================================
    @Override
    public Clinic updateClinic(String clinicId, ClinicRegistrationDTO dto) {

        Clinic clinic = repo.findById(clinicId)
                .orElseThrow(() -> new ProcedureServiceException("Clinic not found", 404, null));

        // -------------------------
        // BASIC FIELD PARTIAL UPDATES
        // -------------------------
        updateIfNotNull(dto.getName(), clinic::setName);
        updateIfNotNull(dto.getAddress(), clinic::setAddress);
        updateIfNotNull(dto.getCity(), clinic::setCity);
        updateIfNotNull(dto.getWhatsappNumber(), clinic::setWhatsappNumber);
        updateIfNotNull(dto.getEmail(), clinic::setEmail);
        updateIfNotNull(dto.getContactNumber(), clinic::setContactNumber);
        updateIfNotNull(dto.getOpeningTime(), clinic::setOpeningTime);
        updateIfNotNull(dto.getClosingTime(), clinic::setClosingTime);
        updateIfNotNull(dto.getWebsite(), clinic::setWebsite);
        updateIfNotNull(dto.getLicenseNumber(), clinic::setLicenseNumber);
        updateIfNotNull(dto.getIssuingAuthority(), clinic::setIssuingAuthority);
        updateIfNotNull(dto.getClinicType(), clinic::setClinicType);
        updateIfNotNull(dto.getSubscription(), clinic::setSubscription);
        updateIfNotNull(dto.getBranch(), clinic::setBranch);
        updateIfNotNull(dto.getWalkthrough(), clinic::setWalkthrough);
        updateIfNotNull(dto.getRole(), clinic::setRole);
        updateIfNotNull(dto.getPermissions(), clinic::setPermissions);

        if (dto.getHospitalOverallRating() > 0) clinic.setHospitalOverallRating(dto.getHospitalOverallRating());
        if (dto.getLatitude() != 0) clinic.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != 0) clinic.setLongitude(dto.getLongitude());
        if (dto.getNabhScore() != 0) clinic.setNabhScore(dto.getNabhScore());

        clinic.setRecommended(dto.isRecommended());

        updateIfNotNull(dto.getPrimaryContactPerson(), clinic::setPrimaryContactPerson);
        updateIfNotNull(dto.getDesignation(), clinic::setDesignation);
        updateIfNotNull(dto.getClinicManagementSoftwareUsage(), clinic::setClinicManagementSoftwareUsage);
        updateIfNotNull(dto.getBankAccountName(), clinic::setBankAccountName);
        updateIfNotNull(dto.getBankAccountNumber(), clinic::setBankAccountNumber);
        updateIfNotNull(dto.getIfscCode(), clinic::setIfscCode);
        updateIfNotNull(dto.getUpiId(), clinic::setUpiId);
        updateIfNotNull(dto.getPanNumber(), clinic::setPanNumber);

        updateIfNotNull(dto.getInstagramHandle(), clinic::setInstagramHandle);
        updateIfNotNull(dto.getTwitterHandle(), clinic::setTwitterHandle);
        updateIfNotNull(dto.getFacebookHandle(), clinic::setFacebookHandle);

        updateIfNotNull(dto.getStatus(), clinic::setStatus);


        // -------------------------
        // DOCUMENT UPDATES
        // -------------------------
        updateIfNotNull(decodeImage(dto.getHospitalLogo()), clinic::setHospitalLogo);
        updateIfNotNull(decode(dto.getContractorDocuments()), clinic::setContractorDocuments);
        updateIfNotNull(decode(dto.getHospitalDocuments()), clinic::setHospitalDocuments);
        updateIfNotNull(decode(dto.getClinicalEstablishmentCertificate()), clinic::setClinicalEstablishmentCertificate);
        updateIfNotNull(decode(dto.getBusinessRegistrationCertificate()), clinic::setBusinessRegistrationCertificate);
        updateIfNotNull(decode(dto.getBiomedicalWasteManagementAuth()), clinic::setBiomedicalWasteManagementAuth);
        updateIfNotNull(decode(dto.getTradeLicense()), clinic::setTradeLicense);
        updateIfNotNull(decode(dto.getFireSafetyCertificate()), clinic::setFireSafetyCertificate);
        updateIfNotNull(decode(dto.getProfessionalIndemnityInsurance()), clinic::setProfessionalIndemnityInsurance);
        updateIfNotNull(decode(dto.getGstRegistrationCertificate()), clinic::setGstRegistrationCertificate);

        if ("Yes".equalsIgnoreCase(dto.getMedicinesSoldOnSite())) {
            updateIfNotNull(decode(dto.getDrugLicenseCertificate()), clinic::setDrugLicenseCertificate);
        }

        if ("Yes".equalsIgnoreCase(dto.getHasPharmacist())) {
            updateIfNotNull(decode(dto.getPharmacistCertificate()), clinic::setPharmacistCertificate);
        }

        if (dto.getOthers() != null) {
            clinic.setOthers(dto.getOthers().stream().map(this::decode).toList());
        }

        // -------------------------
        // DOCTOR LIST UPDATE
        // -------------------------
        if (dto.getDoctorsList() != null) {

            validateDuplicateDoctors(dto.getDoctorsList());

            List<Doctor> doctorList = dto.getDoctorsList().stream().map(d -> {
                Doctor doc = new Doctor();
                doc.setDoctorName(d.getDoctorName());
                doc.setRegistrationNumber(d.getRegistrationNumber());
                doc.setAssociationNumber(d.getAssociationNumber());
                doc.setAssociationName(d.getAssociationName());
                doc.setSpecialization(d.getSpecialization());
                return doc;
            }).toList();

            clinic.setDoctorsList(doctorList);
        }

        return repo.save(clinic);
    }

    
    // ==========================================================================================
    // LOGIN (PLAIN TEXT)
    // ==========================================================================================
    @Override
    public Clinic login(String username, String password) {
        Clinic clinic = repo.findByUsername(username);

        if (clinic == null || !"VERIFIED".equalsIgnoreCase(clinic.getStatus())) {
            return null;
        }

        if (!clinic.getPassword().equals(password)) {
            return null;
        }

        return clinic;
    }
    
    // ==========================================================================================
    // CHANGE PASSWORD — PLAIN TEXT
    // ==========================================================================================
    @Override
    public void changePassword(ChangePasswordDTO dto) {

        // 1. Find the clinic by username
        Clinic clinic = repo.findByUsername(dto.getUsername());
        if (clinic == null) {
            throw new ProcedureServiceException("Invalid username", 404, null);
        }

        // 2. Verify current password
        if (!clinic.getPassword().equals(dto.getCurrentPassword())) {
            throw new ProcedureServiceException("Current password is incorrect", 400, null);
        }

        // 3. Ensure new password is different from current password
        if (dto.getCurrentPassword().equals(dto.getNewPassword())) {
            throw new ProcedureServiceException("New password must be different from current password", 400, null);
        }

        // 4. Confirm new password matches confirm password
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new ProcedureServiceException("New password and confirm password do not match", 400, null);
        }

        // 5. Update the password
        clinic.setPassword(dto.getNewPassword());
        repo.save(clinic);
    }

    // ==========================================================================================
    // FORGOT PASSWORD (OTP)
    // ==========================================================================================
    @Override
    public ApiResponse<Void> forgotPassword(ForgotPasswordRequest request) {

        String id = request.getIdentifier();

        Clinic clinic = repo.findByEmail(id);
        boolean isEmail = true;

        if (clinic == null) {
            clinic = repo.findByWhatsappNumber(id);
            isEmail = false;
        }

        if (clinic == null) {
            throw new ProcedureServiceException(
                    id.contains("@")
                            ? "No clinic found with this email"
                            : "No clinic found with this WhatsApp",
                    404, null
            );
        }

        Instant now = Instant.now();

        if (clinic.getOtpSentTime() != null &&
                now.isBefore(clinic.getOtpSentTime().plusSeconds(30))) {
            throw new ProcedureServiceException(
                    "OTP already sent. Please wait before requesting again",
                    429, null
            );
        }

        String otp = String.valueOf(100000 + new SecureRandom().nextInt(900000));

        clinic.setOtpCode(otp);
        clinic.setOtpExpiry(now.plusSeconds(300));
        clinic.setOtpSentTime(now);
        clinic.setOtpAttempts(0);

        repo.save(clinic);

        // 🔥 IMPORTANT CHANGE
        asyncVerificationService.sendOtpAsync(
                clinic,
                otp,
                CLINIC_PASSWORD_RESET
        );

        return new ApiResponse<>(
                true,
                isEmail ? "OTP sent to email" : "OTP sent to WhatsApp",
                null
        );
    }

    // ==========================================================================================
    // RESEND OTP
    // ==========================================================================================
    @Override
    public ApiResponse<Void> resendOtp(ForgotPasswordRequest request) {

        String id = request.getIdentifier();

        Clinic clinic = repo.findByEmail(id);
        boolean isEmail = true;

        if (clinic == null) {
            clinic = repo.findByWhatsappNumber(id);
            isEmail = false;
        }

        if (clinic == null) {
            throw new ProcedureServiceException(
                    id.contains("@")
                            ? "No clinic found with this email"
                            : "No clinic found with this WhatsApp",
                    404, null
            );
        }

        Instant now = Instant.now();

        if (clinic.getOtpSentTime() != null &&
                now.isBefore(clinic.getOtpSentTime().plusSeconds(30))) {
            throw new ProcedureServiceException(
                    "OTP already sent. Please wait before requesting again",
                    429, null
            );
        }

        String otp = String.valueOf(100000 + new SecureRandom().nextInt(900000));

        clinic.setOtpCode(otp);
        clinic.setOtpExpiry(now.plusSeconds(300));
        clinic.setOtpSentTime(now);
        clinic.setOtpAttempts(0);

        repo.save(clinic);

        // 🔥 IMPORTANT CHANGE
        asyncVerificationService.sendOtpAsync(
                clinic,
                otp,
                CLINIC_PASSWORD_RESET
        );

        return new ApiResponse<>(
                true,
                isEmail ? "OTP resent to email" : "OTP resent to WhatsApp",
                null
        );
    }


    // ==========================================================================================
    // RESET PASSWORD
    // ==========================================================================================
    @Override
    public ApiResponse<Void> resetPassword(ResetPasswordRequest request) {

        String id = request.getIdentifier();
        Clinic clinic;
        boolean isEmail = id.contains("@");

        if (isEmail) {
            clinic = repo.findByEmail(id);
            if (clinic == null) {
                throw new ProcedureServiceException("No clinic found with this email", 404, null);
            }
        } else {
            clinic = repo.findByWhatsappNumber(id);
            if (clinic == null) {
                throw new ProcedureServiceException("No clinic found with this WhatsApp number", 404, null);
            }
        }

        // Check OTP
        if (clinic.getOtpCode() == null || clinic.getOtpExpiry() == null) {
            throw new ProcedureServiceException("OTP was not requested", 400, null);
        }

        if (Instant.now().isAfter(clinic.getOtpExpiry())) {
            throw new ProcedureServiceException("OTP expired", 400, null);
        }

        if (clinic.getOtpAttempts() >= 5) {
            throw new ProcedureServiceException("Max OTP attempts exceeded", 429, null);
        }

        if (!request.getOtp().equals(clinic.getOtpCode())) {
            clinic.setOtpAttempts(clinic.getOtpAttempts() + 1);
            repo.save(clinic);
            throw new ProcedureServiceException("Invalid OTP", 400, null);
        }

        // Reset password
        clinic.setPassword(request.getNewPassword());
        clinic.setOtpCode(null);
        clinic.setOtpExpiry(null);
        clinic.setOtpSentTime(null);
        clinic.setOtpAttempts(0);

        repo.save(clinic);

        return new ApiResponse<>(true,
                isEmail ?
                        "Password reset successful for email" :
                        "Password reset successful for WhatsApp",
                null);
    }

    
    // ==========================================================================================
    
 // ==========================================================================================
 // PAYOUT LOGIN (PLAIN TEXT)
 // ==========================================================================================
 @Override
 public Clinic payoutLogin(String payoutUsername, String payoutPassword) {
     Clinic clinic = repo.findByPayoutUsername(payoutUsername);

     if (clinic == null || !"VERIFIED".equalsIgnoreCase(clinic.getStatus())) {
         return null;
     }

     if (!clinic.getPayoutPassword().equals(payoutPassword)) {
         return null;
     }

     return clinic;
 }

 // ==========================================================================================
 // CHANGE PAYOUT PASSWORD — PLAIN TEXT
 // ==========================================================================================
 @Override
 public void changePayoutPassword(ChangePayoutPasswordDTO dto) {

     Clinic clinic = repo.findByPayoutUsername(dto.getPayoutUsername());
     if (clinic == null) {
         throw new ProcedureServiceException("Invalid payout username", 404, null);
     }

     if (!clinic.getPayoutPassword().equals(dto.getCurrentPayoutPassword())) {
         throw new ProcedureServiceException("Current payout password is incorrect", 400, null);
     }

     if (dto.getCurrentPayoutPassword().equals(dto.getNewPayoutPassword())) {
         throw new ProcedureServiceException("New payout password must be different from current password", 400, null);
     }

     if (!dto.getNewPayoutPassword().equals(dto.getConfirmPayoutPassword())) {
         throw new ProcedureServiceException("New payout password and confirm password do not match", 400, null);
     }

     clinic.setPayoutPassword(dto.getNewPayoutPassword());
     repo.save(clinic);
 }

 // ==========================================================================================
 // FORGOT PAYOUT PASSWORD (OTP)
 // ==========================================================================================
 @Override
 public ApiResponse<Void> forgotPayoutPassword(ForgotPasswordRequest request) {

     String id = request.getIdentifier();

     Clinic clinic = repo.findByEmail(id);
     boolean isEmail = true;

     if (clinic == null) {
         clinic = repo.findByWhatsappNumber(id);
         isEmail = false;
     }

     if (clinic == null) {
         throw new ProcedureServiceException(
                 id.contains("@")
                         ? "No clinic found with this email"
                         : "No clinic found with this WhatsApp",
                 404, null
         );
     }

     Instant now = Instant.now();

     if (clinic.getPayoutOtpSentTime() != null &&
             now.isBefore(clinic.getPayoutOtpSentTime().plusSeconds(30))) {
         throw new ProcedureServiceException(
                 "OTP already sent. Please wait before requesting again",
                 429, null
         );
     }

     String otp = String.valueOf(100000 + new SecureRandom().nextInt(900000));

     clinic.setPayoutOtpCode(otp);
     clinic.setPayoutOtpExpiry(now.plusSeconds(300));
     clinic.setPayoutOtpSentTime(now);
     clinic.setPayoutOtpAttempts(0);

     repo.save(clinic);

     // 🔥 IMPORTANT CHANGE
     asyncVerificationService.sendOtpAsync(
             clinic,
             otp,
             PAYOUT_PASSWORD_RESET
     );

     return new ApiResponse<>(
             true,
             isEmail ? "Payout OTP sent to email" : "Payout OTP sent to WhatsApp",
             null
     );
 }


 // ==========================================================================================
 // RESEND PAYOUT OTP
 // ==========================================================================================
 @Override
 public ApiResponse<Void> resendPayoutOtp(ForgotPasswordRequest request) {

     String id = request.getIdentifier();

     Clinic clinic = repo.findByEmail(id);
     boolean isEmail = true;

     if (clinic == null) {
         clinic = repo.findByWhatsappNumber(id);
         isEmail = false;
     }

     if (clinic == null) {
         throw new ProcedureServiceException(
                 id.contains("@")
                         ? "No clinic found with this email"
                         : "No clinic found with this WhatsApp",
                 404, null
         );
     }

     Instant now = Instant.now();

     if (clinic.getPayoutOtpSentTime() != null &&
             now.isBefore(clinic.getPayoutOtpSentTime().plusSeconds(30))) {
         throw new ProcedureServiceException(
                 "OTP already sent. Please wait before requesting again",
                 429, null
         );
     }

     String otp = String.valueOf(100000 + new SecureRandom().nextInt(900000));

     clinic.setPayoutOtpCode(otp);
     clinic.setPayoutOtpExpiry(now.plusSeconds(300));
     clinic.setPayoutOtpSentTime(now);
     clinic.setPayoutOtpAttempts(0);

     repo.save(clinic);

     // 🔥 IMPORTANT CHANGE
     asyncVerificationService.sendOtpAsync(
             clinic,
             otp,
             PAYOUT_PASSWORD_RESET
     );

     return new ApiResponse<>(
             true,
             isEmail ? "Payout OTP resent to email" : "Payout OTP resent to WhatsApp",
             null
     );
 }


 // ==========================================================================================
 // RESET PAYOUT PASSWORD
 // ==========================================================================================
 @Override
 public ApiResponse<Void> resetPayoutPassword(ResetPasswordRequest request) {

     String id = request.getIdentifier();
     Clinic clinic;
     boolean isEmail = id.contains("@");

     if (isEmail) {
         clinic = repo.findByEmail(id);
         if (clinic == null) {
             throw new ProcedureServiceException("No clinic found with this email", 404, null);
         }
     } else {
         clinic = repo.findByWhatsappNumber(id);
         if (clinic == null) {
             throw new ProcedureServiceException("No clinic found with this WhatsApp number", 404, null);
         }
     }

     if (clinic.getPayoutOtpCode() == null || clinic.getPayoutOtpExpiry() == null) {
         throw new ProcedureServiceException("OTP was not requested", 400, null);
     }

     if (Instant.now().isAfter(clinic.getPayoutOtpExpiry())) {
         throw new ProcedureServiceException("OTP expired", 400, null);
     }

     if (clinic.getPayoutOtpAttempts() >= 5) {
         throw new ProcedureServiceException("Max OTP attempts exceeded", 429, null);
     }

     if (!request.getOtp().equals(clinic.getPayoutOtpCode())) {
         clinic.setPayoutOtpAttempts(clinic.getPayoutOtpAttempts() + 1);
         repo.save(clinic);
         throw new ProcedureServiceException("Invalid OTP", 400, null);
     }

     clinic.setPayoutPassword(request.getNewPassword());
     clinic.setPayoutOtpCode(null);
     clinic.setPayoutOtpExpiry(null);
     clinic.setPayoutOtpSentTime(null);
     clinic.setPayoutOtpAttempts(0);

     repo.save(clinic);

     return new ApiResponse<>(true,
             isEmail ?
                     "Payout password reset successful for email" :
                     "Payout password reset successful for WhatsApp",
             null);
 }

    
    

    // ==========================================================================================
    // HELPER METHODS
    // ==========================================================================================
    private <T> void updateIfNotNull(T value, java.util.function.Consumer<T> setter) {
        if (value != null) setter.accept(value);
    }

    private Clinic findClinic(String clinicId) {
        return repo.findById(clinicId)
                .orElseThrow(() -> new ProcedureServiceException("Clinic not found", 404, null));
    }

    private byte[] decode(String base64) {
        if (base64 == null || base64.isBlank()) return null;
        return Base64.getDecoder().decode(base64);
    }

    private byte[] decodeImage(String base64) {
        if (base64 == null) return null;
        base64 = base64.replaceFirst("^data:image/[^;]+;base64,", "");
        return Base64.getDecoder().decode(base64);
    }

    private void decodeDocuments(ClinicRegistrationDTO dto, Clinic clinic) {
        try {
            clinic.setHospitalLogo(decodeImage(dto.getHospitalLogo()));
            clinic.setContractorDocuments(decode(dto.getContractorDocuments()));
            clinic.setHospitalDocuments(decode(dto.getHospitalDocuments()));
            clinic.setClinicalEstablishmentCertificate(decode(dto.getClinicalEstablishmentCertificate()));
            clinic.setBusinessRegistrationCertificate(decode(dto.getBusinessRegistrationCertificate()));
            clinic.setBiomedicalWasteManagementAuth(decode(dto.getBiomedicalWasteManagementAuth()));
            clinic.setTradeLicense(decode(dto.getTradeLicense()));
            clinic.setFireSafetyCertificate(decode(dto.getFireSafetyCertificate()));
            clinic.setProfessionalIndemnityInsurance(decode(dto.getProfessionalIndemnityInsurance()));
            clinic.setGstRegistrationCertificate(decode(dto.getGstRegistrationCertificate()));

            if (dto.getOthers() != null) {
                clinic.setOthers(dto.getOthers().stream().map(this::decode).toList());
            }

        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid Base64 document format: " + ex.getMessage());
        }
    }

    private void validateDuplicateDoctors(List<DoctorDTO> doctorsList) {

        Set<String> regNos = doctorsList.stream()
                .map(DoctorDTO::getRegistrationNumber)
                .collect(Collectors.toSet());

        if (regNos.size() != doctorsList.size()) {
            throw new ProcedureServiceException("Duplicate doctor registrationNumber detected", 400, null);
        }

        Set<String> assocNos = doctorsList.stream()
                .map(DoctorDTO::getAssociationNumber)
                .collect(Collectors.toSet());

        if (assocNos.size() != doctorsList.size()) {
            throw new ProcedureServiceException("Duplicate doctor associationNumber detected", 400, null);
        }
    }

    private void copyBasicFields(ClinicRegistrationDTO dto, Clinic clinic) {

        clinic.setName(dto.getName());
        clinic.setAddress(dto.getAddress());
        clinic.setCity(dto.getCity());
        clinic.setContactNumber(dto.getContactNumber());
        clinic.setOpeningTime(dto.getOpeningTime());
        clinic.setClosingTime(dto.getClosingTime());
        clinic.setWebsite(dto.getWebsite());
        clinic.setLicenseNumber(dto.getLicenseNumber());
        clinic.setIssuingAuthority(dto.getIssuingAuthority());
        clinic.setLatitude(dto.getLatitude());
        clinic.setLongitude(dto.getLongitude());
        clinic.setBranch(dto.getBranch());
        clinic.setWalkthrough(dto.getWalkthrough());
        clinic.setNabhScore(dto.getNabhScore());
        clinic.setClinicType(dto.getClinicType());
        clinic.setSubscription(dto.getSubscription());
        clinic.setRecommended(dto.isRecommended());
        clinic.setPrimaryContactPerson(dto.getPrimaryContactPerson());
        clinic.setDesignation(dto.getDesignation());
        clinic.setClinicManagementSoftwareUsage(dto.getClinicManagementSoftwareUsage());
        clinic.setBankAccountName(dto.getBankAccountName());
        clinic.setBankAccountNumber(dto.getBankAccountNumber());
        clinic.setIfscCode(dto.getIfscCode());
        clinic.setUpiId(dto.getUpiId());
        clinic.setPanNumber(dto.getPanNumber());
        clinic.setInstagramHandle(dto.getInstagramHandle());
        clinic.setTwitterHandle(dto.getTwitterHandle());
        clinic.setFacebookHandle(dto.getFacebookHandle());
        clinic.setMedicinesSoldOnSite(dto.getMedicinesSoldOnSite());
        clinic.setHasPharmacist(dto.getHasPharmacist());
        clinic.setDrugLicenseFormType(dto.getDrugLicenseFormType());

        if (dto.getDoctorsList() != null) {
            validateDuplicateDoctors(dto.getDoctorsList());

            List<Doctor> doctorList = dto.getDoctorsList().stream().map(d -> {
                Doctor doc = new Doctor();
                doc.setDoctorName(d.getDoctorName());
                doc.setRegistrationNumber(d.getRegistrationNumber());
                doc.setAssociationNumber(d.getAssociationNumber());
                doc.setAssociationName(d.getAssociationName());
                doc.setSpecialization(d.getSpecialization());
                return doc;
            }).toList();

            clinic.setDoctorsList(doctorList);
        }
    }
}
