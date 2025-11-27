package com.glowkart.admin.service;

import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.glowkart.admin.client.OnboardingClient;
import com.glowkart.admin.dto.ClinicRegistrationDTO;
import com.glowkart.admin.exception.ProcedureServiceException;
import com.glowkart.admin.model.Clinic;
import com.glowkart.admin.repo.ClinicRepository;
import com.glowkart.admin.util.CredentialGenerator;
import com.glowkart.admin.util.PermissionsUtil;

@Service
public class ClinicServiceImpl implements ClinicService {

    private final ClinicRepository repo;
    private final OnboardingClient onboardingClient;
    private final AsyncVerificationService asyncVerificationService;

    public ClinicServiceImpl(ClinicRepository repo,
                             OnboardingClient onboardingClient,
                             AsyncVerificationService asyncVerificationService) {
        this.repo = repo;
        this.onboardingClient = onboardingClient;
        this.asyncVerificationService = asyncVerificationService;
    }

    // -----------------------------------------------------
    // REGISTER CLINIC
    // -----------------------------------------------------
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

        // Email & WhatsApp fallback
        clinic.setWhatsappNumber(dto.getWhatsappNumber() != null ? dto.getWhatsappNumber() : tokenWhatsapp);
        clinic.setEmail(dto.getEmail() != null ? dto.getEmail() : tokenEmail);

        clinic.setRole(dto.getRole() != null ? dto.getRole() : "ADMIN");
        clinic.setPermissions(dto.getPermissions() != null ? dto.getPermissions() : PermissionsUtil.getAdminPermissions());

        // Decode documents
        decodeDocuments(dto, clinic);

        // Generate login credentials
        Map<String, String> credentials = CredentialGenerator.generate();
        clinic.setUsername(credentials.get("username"));
        clinic.setPassword(credentials.get("password"));

        clinic.setStatus("PENDING");
        clinic.setCreatedAt(Instant.now());

        Clinic saved = repo.save(clinic);

        onboardingClient.markUsed(Map.of("token", dto.getToken()));
        asyncVerificationService.sendAcknowledgementAsync(saved);

        return saved;
    }

    // -----------------------------------------------------
    // VERIFICATION
    // -----------------------------------------------------
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

        if (clinic.getUsername() == null || clinic.getPassword() == null) {
            Map<String, String> creds = CredentialGenerator.generate();
            clinic.setUsername(creds.get("username"));
            clinic.setPassword(creds.get("password"));
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

        return clinic; // return updated clinic
    }


    // -----------------------------------------------------
    // CRUD
    // -----------------------------------------------------
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
        if (!repo.existsById(clinicId))
            throw new ProcedureServiceException("Clinic not found", 404, null);

        repo.deleteById(clinicId);
    }
    @Override
    public Clinic login(String username, String password) {
        Clinic clinic = repo.findByUsername(username);
        if (clinic == null || !"VERIFIED".equals(clinic.getStatus()) || !clinic.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Invalid username or password");
        }
        return clinic;
    }

    @Override
    public Clinic updateClinic(String clinicId, ClinicRegistrationDTO dto) {
        Clinic clinic = repo.findById(clinicId)
                .orElseThrow(() -> new ProcedureServiceException("Clinic not found", 404, null));

        // Partial updates (skip nulls)
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

        // Numeric updates
        if (dto.getHospitalOverallRating() > 0) clinic.setHospitalOverallRating(dto.getHospitalOverallRating());
        if (dto.getLatitude() != 0) clinic.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != 0) clinic.setLongitude(dto.getLongitude());
        if (dto.getNabhScore() != 0) clinic.setNabhScore(dto.getNabhScore());

        clinic.setRecommended(dto.isRecommended());

        // New fields
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

        // Document updates
        updateIfNotNull(decodeImage(dto.getHospitalLogo()), clinic::setHospitalLogo);
        updateIfNotNull(decode(dto.getContractorDocuments()), clinic::setContractorDocuments);
        updateIfNotNull(decode(dto.getHospitalDocuments()), clinic::setHospitalDocuments);
        updateIfNotNull(decode(dto.getClinicalEstablishmentCertificate()), clinic::setClinicalEstablishmentCertificate);
        updateIfNotNull(decode(dto.getBusinessRegistrationCertificate()), clinic::setBusinessRegistrationCertificate);

        if ("Yes".equalsIgnoreCase(dto.getMedicinesSoldOnSite())) {
            updateIfNotNull(decode(dto.getDrugLicenseCertificate()), clinic::setDrugLicenseCertificate);
            updateIfNotNull(dto.getDrugLicenseFormType(), clinic::setDrugLicenseFormType);
        }

        if ("Yes".equalsIgnoreCase(dto.getHasPharmacist())) {
            updateIfNotNull(decode(dto.getPharmacistCertificate()), clinic::setPharmacistCertificate);
        }

        updateIfNotNull(decode(dto.getBiomedicalWasteManagementAuth()), clinic::setBiomedicalWasteManagementAuth);
        updateIfNotNull(decode(dto.getTradeLicense()), clinic::setTradeLicense);
        updateIfNotNull(decode(dto.getFireSafetyCertificate()), clinic::setFireSafetyCertificate);
        updateIfNotNull(decode(dto.getProfessionalIndemnityInsurance()), clinic::setProfessionalIndemnityInsurance);
        updateIfNotNull(decode(dto.getGstRegistrationCertificate()), clinic::setGstRegistrationCertificate);

        if (dto.getOthers() != null) {
            clinic.setOthers(dto.getOthers().stream().map(this::decode).toList());
        }

        return repo.save(clinic);
    }

    // -----------------------------------------------------
    // HELPER
    // -----------------------------------------------------
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

    // -----------------------------------------------------
    // COPY BASIC FIELDS (for clean code)
    // -----------------------------------------------------
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

        // new fields
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
    }

    // -----------------------------------------------------
    // DOCUMENT DECODING
    // -----------------------------------------------------
    private void decodeDocuments(ClinicRegistrationDTO dto, Clinic clinic) {
        try {
            clinic.setHospitalLogo(decodeImage(dto.getHospitalLogo()));

            clinic.setContractorDocuments(decode(dto.getContractorDocuments()));
            clinic.setHospitalDocuments(decode(dto.getHospitalDocuments()));
            clinic.setClinicalEstablishmentCertificate(decode(dto.getClinicalEstablishmentCertificate()));
            clinic.setBusinessRegistrationCertificate(decode(dto.getBusinessRegistrationCertificate()));

            if ("Yes".equalsIgnoreCase(dto.getMedicinesSoldOnSite())) {
                clinic.setDrugLicenseCertificate(decode(dto.getDrugLicenseCertificate()));
            }

            if ("Yes".equalsIgnoreCase(dto.getHasPharmacist())) {
                clinic.setPharmacistCertificate(decode(dto.getPharmacistCertificate()));
            }

            clinic.setBiomedicalWasteManagementAuth(decode(dto.getBiomedicalWasteManagementAuth()));
            clinic.setTradeLicense(decode(dto.getTradeLicense()));
            clinic.setFireSafetyCertificate(decode(dto.getFireSafetyCertificate()));
            clinic.setProfessionalIndemnityInsurance(decode(dto.getProfessionalIndemnityInsurance()));
            clinic.setGstRegistrationCertificate(decode(dto.getGstRegistrationCertificate()));

            if (dto.getOthers() != null) {
                clinic.setOthers(dto.getOthers()
                        .stream()
                        .map(this::decode)
                        .toList());
            }

        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid Base64 document format: " + ex.getMessage());
        }
    }

   
}
