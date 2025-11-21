package com.glowkart.admin.service;

import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.glowkart.admin.client.OnboardingClient;
import com.glowkart.admin.dto.ClinicRegistrationDTO;
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

    @Override
    public Clinic registerClinic(ClinicRegistrationDTO dto) {
        Map<String, Object> tokenInfo = onboardingClient.verifyToken(dto.getToken());
        if (tokenInfo == null) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        String tokenWhatsapp = (String) tokenInfo.get("whatsappNumber");
        String tokenEmail = (String) tokenInfo.get("email");

        Clinic clinic = new Clinic();
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

        // WhatsApp and Email fallback
        clinic.setWhatsappNumber(tokenWhatsapp != null ? tokenWhatsapp : dto.getWhatsappNumber());
        clinic.setEmail(dto.getEmail() != null ? dto.getEmail() : tokenEmail);

        // Role and permissions
        clinic.setRole(dto.getRole() != null ? dto.getRole() : "ADMIN");
        clinic.setPermissions(dto.getPermissions() != null ? dto.getPermissions() : PermissionsUtil.getAdminPermissions());

        // New fields
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

        decodeBase64Documents(dto, clinic);

        // Generate credentials
        Map<String, String> credentials = CredentialGenerator.generate();
        clinic.setUsername(credentials.get("username"));
        clinic.setPassword(credentials.get("password"));

        clinic.setStatus("PENDING");
        clinic.setCreatedAt(Instant.now());

        Clinic savedClinic = repo.save(clinic);
        onboardingClient.markUsed(Map.of("token", dto.getToken()));
        asyncVerificationService.sendAcknowledgementAsync(savedClinic);

        return savedClinic;
    }

    private void decodeBase64Documents(ClinicRegistrationDTO dto, Clinic clinic) {
        try {
            if (dto.getHospitalLogo() != null && !dto.getHospitalLogo().isEmpty()) {
                clinic.setHospitalLogo(Base64.getDecoder().decode(stripBase64Header(dto.getHospitalLogo())));
            }
            if (dto.getContractorDocuments() != null && !dto.getContractorDocuments().isEmpty()) {
                clinic.setContractorDocuments(Base64.getDecoder().decode(dto.getContractorDocuments()));
            }
            if (dto.getHospitalDocuments() != null && !dto.getHospitalDocuments().isEmpty()) {
                clinic.setHospitalDocuments(Base64.getDecoder().decode(dto.getHospitalDocuments()));
            }
            if (dto.getClinicalEstablishmentCertificate() != null && !dto.getClinicalEstablishmentCertificate().isEmpty()) {
                clinic.setClinicalEstablishmentCertificate(Base64.getDecoder().decode(dto.getClinicalEstablishmentCertificate()));
            }
            if (dto.getBusinessRegistrationCertificate() != null && !dto.getBusinessRegistrationCertificate().isEmpty()) {
                clinic.setBusinessRegistrationCertificate(Base64.getDecoder().decode(dto.getBusinessRegistrationCertificate()));
            }
            if ("Yes".equalsIgnoreCase(dto.getMedicinesSoldOnSite()) && dto.getDrugLicenseCertificate() != null) {
                clinic.setDrugLicenseCertificate(Base64.getDecoder().decode(dto.getDrugLicenseCertificate()));
            }
            if ("Yes".equalsIgnoreCase(dto.getHasPharmacist()) && dto.getPharmacistCertificate() != null) {
                clinic.setPharmacistCertificate(Base64.getDecoder().decode(dto.getPharmacistCertificate()));
            }
            if (dto.getBiomedicalWasteManagementAuth() != null) {
                clinic.setBiomedicalWasteManagementAuth(Base64.getDecoder().decode(dto.getBiomedicalWasteManagementAuth()));
            }
            if (dto.getTradeLicense() != null) {
                clinic.setTradeLicense(Base64.getDecoder().decode(dto.getTradeLicense()));
            }
            if (dto.getFireSafetyCertificate() != null) {
                clinic.setFireSafetyCertificate(Base64.getDecoder().decode(dto.getFireSafetyCertificate()));
            }
            if (dto.getProfessionalIndemnityInsurance() != null) {
                clinic.setProfessionalIndemnityInsurance(Base64.getDecoder().decode(dto.getProfessionalIndemnityInsurance()));
            }
            if (dto.getGstRegistrationCertificate() != null) {
                clinic.setGstRegistrationCertificate(Base64.getDecoder().decode(dto.getGstRegistrationCertificate()));
            }
            if (dto.getOthers() != null && !dto.getOthers().isEmpty()) {
                clinic.setOthers(dto.getOthers().stream().map(Base64.getDecoder()::decode).toList());
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Error decoding Base64 documents: " + e.getMessage());
        }
    }

    private String stripBase64Header(String base64) {
        return base64.replaceFirst("^data:image/[^;]+;base64,", "");
    }

    @Override
    public void startVerificationProcess(String clinicId) {
        Clinic clinic = repo.findById(clinicId)
                .orElseThrow(() -> new IllegalStateException("Clinic not found"));
        clinic.setStatus("VERIFICATION_IN_PROGRESS");
        repo.save(clinic);
        asyncVerificationService.sendVerificationStartedAsync(clinic);
    }

    @Override
    public void verifyClinic(String clinicId) {
        Clinic clinic = repo.findById(clinicId)
                .orElseThrow(() -> new IllegalStateException("Clinic not found"));
        clinic.setStatus("VERIFIED");

        if (clinic.getUsername() == null || clinic.getPassword() == null) {
            Map<String, String> credentials = CredentialGenerator.generate();
            clinic.setUsername(credentials.get("username"));
            clinic.setPassword(credentials.get("password"));
        }

        repo.save(clinic);
        asyncVerificationService.sendCredentialsAsync(clinic);
    }

    @Override
    public void rejectClinic(String clinicId, String reason) {
        Clinic clinic = repo.findById(clinicId)
                .orElseThrow(() -> new IllegalStateException("Clinic not found"));
        clinic.setStatus("REJECTED");
        repo.save(clinic);
        asyncVerificationService.sendRejectionNotificationAsync(clinic, reason);
    }

    @Override
    public List<Clinic> getAll() {
        return repo.findAll();
    }

    @Override
    public Clinic getById(String clinicId) {
        return repo.findById(clinicId)
                .orElseThrow(() -> new IllegalArgumentException("Clinic not found"));
    }

    @Override
    public Clinic updateClinic(String clinicId, ClinicRegistrationDTO dto) {
        Clinic clinic = repo.findById(clinicId)
                .orElseThrow(() -> new RuntimeException("Clinic not found"));

        if (dto.getName() != null) clinic.setName(dto.getName());
        if (dto.getAddress() != null) clinic.setAddress(dto.getAddress());
        if (dto.getCity() != null) clinic.setCity(dto.getCity());
        if (dto.getWhatsappNumber() != null) clinic.setWhatsappNumber(dto.getWhatsappNumber());
        if (dto.getEmail() != null) clinic.setEmail(dto.getEmail());
        if (dto.getHospitalOverallRating() != 0) clinic.setHospitalOverallRating(dto.getHospitalOverallRating());
        if (dto.getContactNumber() != null) clinic.setContactNumber(dto.getContactNumber());
        if (dto.getOpeningTime() != null) clinic.setOpeningTime(dto.getOpeningTime());
        if (dto.getClosingTime() != null) clinic.setClosingTime(dto.getClosingTime());
        if (dto.getHospitalLogo() != null) clinic.setHospitalLogo(Base64.getDecoder().decode(stripBase64Header(dto.getHospitalLogo())));
        if (dto.getWebsite() != null) clinic.setWebsite(dto.getWebsite());
        if (dto.getLicenseNumber() != null) clinic.setLicenseNumber(dto.getLicenseNumber());
        if (dto.getIssuingAuthority() != null) clinic.setIssuingAuthority(dto.getIssuingAuthority());
        if (dto.getContractorDocuments() != null) clinic.setContractorDocuments(Base64.getDecoder().decode(dto.getContractorDocuments()));
        if (dto.getHospitalDocuments() != null) clinic.setHospitalDocuments(Base64.getDecoder().decode(dto.getHospitalDocuments()));
        clinic.setRecommended(dto.isRecommended());

        if (dto.getClinicType() != null) clinic.setClinicType(dto.getClinicType());
        if (dto.getMedicinesSoldOnSite() != null) clinic.setMedicinesSoldOnSite(dto.getMedicinesSoldOnSite());
        if (dto.getDrugLicenseCertificate() != null) clinic.setDrugLicenseCertificate(Base64.getDecoder().decode(dto.getDrugLicenseCertificate()));
        if (dto.getDrugLicenseFormType() != null) clinic.setDrugLicenseFormType(dto.getDrugLicenseFormType());
        if (dto.getHasPharmacist() != null) clinic.setHasPharmacist(dto.getHasPharmacist());
        if (dto.getPharmacistCertificate() != null) clinic.setPharmacistCertificate(Base64.getDecoder().decode(dto.getPharmacistCertificate()));

        if (dto.getBiomedicalWasteManagementAuth() != null) clinic.setBiomedicalWasteManagementAuth(Base64.getDecoder().decode(dto.getBiomedicalWasteManagementAuth()));
        if (dto.getTradeLicense() != null) clinic.setTradeLicense(Base64.getDecoder().decode(dto.getTradeLicense()));
        if (dto.getFireSafetyCertificate() != null) clinic.setFireSafetyCertificate(Base64.getDecoder().decode(dto.getFireSafetyCertificate()));
        if (dto.getProfessionalIndemnityInsurance() != null) clinic.setProfessionalIndemnityInsurance(Base64.getDecoder().decode(dto.getProfessionalIndemnityInsurance()));
        if (dto.getGstRegistrationCertificate() != null) clinic.setGstRegistrationCertificate(Base64.getDecoder().decode(dto.getGstRegistrationCertificate()));

        if (dto.getSubscription() != null) clinic.setSubscription(dto.getSubscription());
        if (dto.getOthers() != null) clinic.setOthers(dto.getOthers().stream().map(Base64.getDecoder()::decode).toList());

        if (dto.getLatitude() != 0) clinic.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != 0) clinic.setLongitude(dto.getLongitude());
        if (dto.getNabhScore() != 0) clinic.setNabhScore(dto.getNabhScore());
        if (dto.getBranch() != null) clinic.setBranch(dto.getBranch());
        if (dto.getWalkthrough() != null) clinic.setWalkthrough(dto.getWalkthrough());

        if (dto.getRole() != null) clinic.setRole(dto.getRole());
        if (dto.getPermissions() != null) clinic.setPermissions(dto.getPermissions());
        if (dto.getInstagramHandle() != null) clinic.setInstagramHandle(dto.getInstagramHandle());
        if (dto.getTwitterHandle() != null) clinic.setTwitterHandle(dto.getTwitterHandle());
        if (dto.getFacebookHandle() != null) clinic.setFacebookHandle(dto.getFacebookHandle());

        if (dto.getStatus() != null) clinic.setStatus(dto.getStatus());

        if (dto.getPrimaryContactPerson() != null) clinic.setPrimaryContactPerson(dto.getPrimaryContactPerson());
        if (dto.getDesignation() != null) clinic.setDesignation(dto.getDesignation());
        if (dto.getClinicManagementSoftwareUsage() != null) clinic.setClinicManagementSoftwareUsage(dto.getClinicManagementSoftwareUsage());
        if (dto.getBankAccountName() != null) clinic.setBankAccountName(dto.getBankAccountName());
        if (dto.getBankAccountNumber() != null) clinic.setBankAccountNumber(dto.getBankAccountNumber());
        if (dto.getIfscCode() != null) clinic.setIfscCode(dto.getIfscCode());
        if (dto.getUpiId() != null) clinic.setUpiId(dto.getUpiId());
        if (dto.getPanNumber() != null) clinic.setPanNumber(dto.getPanNumber());

        return repo.save(clinic);
    }

    @Override
    public void deleteClinic(String clinicId) {
        if (!repo.existsById(clinicId)) throw new IllegalArgumentException("Clinic not found");
        repo.deleteById(clinicId);
    }

    @Override
    public Clinic login(String username, String password) {
        Clinic clinic = repo.findByUsername(username);
        if (clinic == null || !"VERIFIED".equals(clinic.getStatus()) || !clinic.getPassword().equals(password)) {
            throw new IllegalArgumentException("Invalid username or password / Clinic not verified");
        }
        return clinic;
    }
}
