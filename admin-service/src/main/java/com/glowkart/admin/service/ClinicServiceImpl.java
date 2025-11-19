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

        // Final values for whatsapp and email
        String finalWhatsapp = tokenWhatsapp != null ? tokenWhatsapp : dto.getWhatsappNumber();
        String finalEmail = dto.getEmail() != null ? dto.getEmail() : tokenEmail;

        // Create a new clinic object
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

        // Set the final values of whatsapp and email
        clinic.setWhatsappNumber(finalWhatsapp);
        clinic.setEmail(finalEmail);

        // Set role and permissions
        String role = dto.getRole() != null ? dto.getRole() : "ADMIN";  // Default to "ADMIN" if no role is provided
        clinic.setRole(role);

        // If permissions are provided in the DTO, use them; otherwise, use the default admin permissions
        Map<String, List<String>> permissions = dto.getPermissions() != null ? dto.getPermissions() : PermissionsUtil.getAdminPermissions();
        clinic.setPermissions(permissions);

        // Set new fields from DTO
        clinic.setPrimaryContactPerson(dto.getPrimaryContactPerson());
        clinic.setDesignation(dto.getDesignation());
        clinic.setClinicManagementSoftwareUsage(dto.getClinicManagementSoftwareUsage());
        clinic.setBankAccountName(dto.getBankAccountName());
        clinic.setBankAccountNumber(dto.getBankAccountNumber());
        clinic.setIfscCode(dto.getIfscCode());
        clinic.setUpiId(dto.getUpiId());  
        clinic.setPanNumber(dto.getPanNumber());

        decodeBase64Documents(dto, clinic);

        // Generate credentials (username and password) for clinic
        Map<String, String> credentials = CredentialGenerator.generate();
        clinic.setUsername(credentials.get("username"));
        clinic.setPassword(credentials.get("password"));

        clinic.setStatus("PENDING");
        clinic.setCreatedAt(Instant.now());

        // Save the clinic to the repository
        Clinic savedClinic = repo.save(clinic);

        // Mark the token as used (if applicable)
        onboardingClient.markUsed(Map.of("token", dto.getToken()));

        // Send registration acknowledgment asynchronously
        asyncVerificationService.sendAcknowledgementAsync(savedClinic);

        return savedClinic;
    }

    // Utility method to decode Base64 documents
    private void decodeBase64Documents(ClinicRegistrationDTO dto, Clinic clinic) {
        try {
            if (dto.getHospitalLogo() != null && !dto.getHospitalLogo().isEmpty()) {
                String base64Data = dto.getHospitalLogo().replaceFirst("data:image/[^;]+;base64,", "");
                clinic.setHospitalLogo(Base64.getDecoder().decode(base64Data));
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

            if ("Yes".equalsIgnoreCase(dto.getMedicinesSoldOnSite())) {
                if (dto.getDrugLicenseCertificate() != null && !dto.getDrugLicenseCertificate().isEmpty()) {
                    clinic.setDrugLicenseCertificate(Base64.getDecoder().decode(dto.getDrugLicenseCertificate()));
                }
                if (dto.getDrugLicenseFormType() != null && !dto.getDrugLicenseFormType().isEmpty()) {
                    clinic.setDrugLicenseFormType(dto.getDrugLicenseFormType());
                }
            }

            if ("Yes".equalsIgnoreCase(dto.getHasPharmacist()) && dto.getPharmacistCertificate() != null && !dto.getPharmacistCertificate().isEmpty()) {
                clinic.setPharmacistCertificate(Base64.getDecoder().decode(dto.getPharmacistCertificate()));
            }

            if (dto.getBiomedicalWasteManagementAuth() != null && !dto.getBiomedicalWasteManagementAuth().isEmpty()) {
                clinic.setBiomedicalWasteManagementAuth(Base64.getDecoder().decode(dto.getBiomedicalWasteManagementAuth()));
            }
            if (dto.getTradeLicense() != null && !dto.getTradeLicense().isEmpty()) {
                clinic.setTradeLicense(Base64.getDecoder().decode(dto.getTradeLicense()));
            }
            if (dto.getFireSafetyCertificate() != null && !dto.getFireSafetyCertificate().isEmpty()) {
                clinic.setFireSafetyCertificate(Base64.getDecoder().decode(dto.getFireSafetyCertificate()));
            }
            if (dto.getProfessionalIndemnityInsurance() != null && !dto.getProfessionalIndemnityInsurance().isEmpty()) {
                clinic.setProfessionalIndemnityInsurance(Base64.getDecoder().decode(dto.getProfessionalIndemnityInsurance()));
            }
            if (dto.getGstRegistrationCertificate() != null && !dto.getGstRegistrationCertificate().isEmpty()) {
                clinic.setGstRegistrationCertificate(Base64.getDecoder().decode(dto.getGstRegistrationCertificate()));
            }

            if (dto.getOthers() != null && !dto.getOthers().isEmpty()) {
                List<byte[]> decodedOthers = dto.getOthers().stream()
                        .map(doc -> Base64.getDecoder().decode(doc))
                        .toList();
                clinic.setOthers(decodedOthers);
            }

        } catch (Exception e) {
            throw new IllegalArgumentException("Error decoding Base64 document fields: " + e.getMessage());
        }
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
        Clinic existingClinic = repo.findById(clinicId)
                .orElseThrow(() -> new RuntimeException("Clinic not found"));

        if (dto.getName() != null) existingClinic.setName(dto.getName());
        if (dto.getAddress() != null) existingClinic.setAddress(dto.getAddress());
        if (dto.getCity() != null) existingClinic.setCity(dto.getCity());
        if (dto.getWhatsappNumber() != null) existingClinic.setWhatsappNumber(dto.getWhatsappNumber());
        if (dto.getEmail() != null) existingClinic.setEmail(dto.getEmail());
        if (dto.getHospitalOverallRating() != 0) existingClinic.setHospitalOverallRating(dto.getHospitalOverallRating());
        if (dto.getContactNumber() != null) existingClinic.setContactNumber(dto.getContactNumber());
        if (dto.getOpeningTime() != null) existingClinic.setOpeningTime(dto.getOpeningTime());
        if (dto.getClosingTime() != null) existingClinic.setClosingTime(dto.getClosingTime());
        if (dto.getHospitalLogo() != null) existingClinic.setHospitalLogo(Base64.getDecoder().decode(dto.getHospitalLogo()));
        if (dto.getWebsite() != null) existingClinic.setWebsite(dto.getWebsite());
        if (dto.getLicenseNumber() != null) existingClinic.setLicenseNumber(dto.getLicenseNumber());
        if (dto.getIssuingAuthority() != null) existingClinic.setIssuingAuthority(dto.getIssuingAuthority());
        if (dto.getContractorDocuments() != null) existingClinic.setContractorDocuments(Base64.getDecoder().decode(dto.getContractorDocuments()));
        if (dto.getHospitalDocuments() != null) existingClinic.setHospitalDocuments(Base64.getDecoder().decode(dto.getHospitalDocuments()));
        existingClinic.setRecommended(dto.isRecommended());

        if (dto.getClinicType() != null) existingClinic.setClinicType(dto.getClinicType());
        if (dto.getMedicinesSoldOnSite() != null) existingClinic.setMedicinesSoldOnSite(dto.getMedicinesSoldOnSite());
        if (dto.getDrugLicenseCertificate() != null) existingClinic.setDrugLicenseCertificate(Base64.getDecoder().decode(dto.getDrugLicenseCertificate()));
        if (dto.getDrugLicenseFormType() != null) existingClinic.setDrugLicenseFormType(dto.getDrugLicenseFormType());
        if (dto.getHasPharmacist() != null) existingClinic.setHasPharmacist(dto.getHasPharmacist());
        if (dto.getPharmacistCertificate() != null) existingClinic.setPharmacistCertificate(Base64.getDecoder().decode(dto.getPharmacistCertificate()));

        if (dto.getBiomedicalWasteManagementAuth() != null) existingClinic.setBiomedicalWasteManagementAuth(Base64.getDecoder().decode(dto.getBiomedicalWasteManagementAuth()));
        if (dto.getTradeLicense() != null) existingClinic.setTradeLicense(Base64.getDecoder().decode(dto.getTradeLicense()));
        if (dto.getFireSafetyCertificate() != null) existingClinic.setFireSafetyCertificate(Base64.getDecoder().decode(dto.getFireSafetyCertificate()));
        if (dto.getProfessionalIndemnityInsurance() != null) existingClinic.setProfessionalIndemnityInsurance(Base64.getDecoder().decode(dto.getProfessionalIndemnityInsurance()));
        if (dto.getGstRegistrationCertificate() != null) existingClinic.setGstRegistrationCertificate(Base64.getDecoder().decode(dto.getGstRegistrationCertificate()));

        if (dto.getSubscription() != null) existingClinic.setSubscription(dto.getSubscription());
        if (dto.getOthers() != null) {
            List<byte[]> others = dto.getOthers().stream()
                    .map(Base64.getDecoder()::decode)
                    .toList();
            existingClinic.setOthers(others);
        }

        if (dto.getLatitude() != 0) existingClinic.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != 0) existingClinic.setLongitude(dto.getLongitude());
        if (dto.getNabhScore() != 0) existingClinic.setNabhScore(dto.getNabhScore());
        if (dto.getBranch() != null) existingClinic.setBranch(dto.getBranch());
        if (dto.getWalkthrough() != null) existingClinic.setWalkthrough(dto.getWalkthrough());

        if (dto.getRole() != null) existingClinic.setRole(dto.getRole());
        if (dto.getPermissions() != null) existingClinic.setPermissions(dto.getPermissions());
        if (dto.getInstagramHandle() != null) existingClinic.setInstagramHandle(dto.getInstagramHandle());
        if (dto.getTwitterHandle() != null) existingClinic.setTwitterHandle(dto.getTwitterHandle());
        if (dto.getFacebookHandle() != null) existingClinic.setFacebookHandle(dto.getFacebookHandle());

        if (dto.getStatus() != null) existingClinic.setStatus(dto.getStatus());

        if (dto.getPrimaryContactPerson() != null) existingClinic.setPrimaryContactPerson(dto.getPrimaryContactPerson());
        if (dto.getDesignation() != null) existingClinic.setDesignation(dto.getDesignation());
        if (dto.getClinicManagementSoftwareUsage() != null) existingClinic.setClinicManagementSoftwareUsage(dto.getClinicManagementSoftwareUsage());
        if (dto.getBankAccountName() != null) existingClinic.setBankAccountName(dto.getBankAccountName());
        if (dto.getBankAccountNumber() != null) existingClinic.setBankAccountNumber(dto.getBankAccountNumber());
        if (dto.getIfscCode() != null) existingClinic.setIfscCode(dto.getIfscCode());
        if (dto.getUpiId() != null) existingClinic.setUpiId(dto.getUpiId());
        if (dto.getPanNumber() != null) existingClinic.setPanNumber(dto.getPanNumber());

        return repo.save(existingClinic);
    }

    @Override
    public void deleteClinic(String clinicId) {
        if (!repo.existsById(clinicId)) {
            throw new IllegalArgumentException("Clinic not found");
        }
        repo.deleteById(clinicId);
    }

    @Override
    public Clinic login(String username, String password) {

        Clinic clinic = repo.findByUsername(username);

        if (clinic == null) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (!"VERIFIED".equals(clinic.getStatus())) {
            throw new IllegalStateException("Clinic is not verified yet");
        }

        if (!clinic.getPassword().equals(password)) { 
            throw new IllegalArgumentException("Invalid username or password");
        }

        return clinic;
    }

}
