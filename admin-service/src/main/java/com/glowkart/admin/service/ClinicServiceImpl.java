package com.glowkart.admin.service;

import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.glowkart.admin.client.OnboardingClient;
import com.glowkart.admin.dto.ClinicRegistrationDTO;
import com.glowkart.admin.dto.DoctorDTO;
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

    public ClinicServiceImpl(ClinicRepository repo,
                             OnboardingClient onboardingClient,
                             AsyncVerificationService asyncVerificationService) {
        this.repo = repo;
        this.onboardingClient = onboardingClient;
        this.asyncVerificationService = asyncVerificationService;
    }

    // =====================================================================
    // REGISTER CLINIC
    // =====================================================================
    @Override
    public Clinic registerClinic(ClinicRegistrationDTO dto) {

        // ---------------------
        // VERIFY TOKEN
        // ---------------------
        Map<String, Object> tokenInfo = onboardingClient.verifyToken(dto.getToken());
        if (tokenInfo == null) {
            throw new ProcedureServiceException("Invalid or expired onboarding token", 400, null);
        }

        String tokenWhatsapp = (String) tokenInfo.get("whatsappNumber");
        String tokenEmail = (String) tokenInfo.get("email");

        // ---------------------
        // CREATE MODEL
        // ---------------------
        Clinic clinic = new Clinic();
        copyBasicFields(dto, clinic);

        clinic.setWhatsappNumber(dto.getWhatsappNumber() != null ? dto.getWhatsappNumber() : tokenWhatsapp);
        clinic.setEmail(dto.getEmail() != null ? dto.getEmail() : tokenEmail);

        clinic.setRole(dto.getRole() != null ? dto.getRole() : "ADMIN");
        clinic.setPermissions(dto.getPermissions() != null ? dto.getPermissions() : PermissionsUtil.getAdminPermissions());

        // ---------------------
        // DECODE DOCUMENTS
        // ---------------------
        decodeDocuments(dto, clinic);

        // ---------------------
        // GENERATE CREDENTIALS
        // ---------------------
        Map<String, String> credentials = CredentialGenerator.generate();
        clinic.setUsername(credentials.get("username"));
        clinic.setPassword(credentials.get("password"));

        clinic.setStatus("PENDING");
        clinic.setCreatedAt(Instant.now());

        // ---------------------
        // SAVE
        // ---------------------
        Clinic saved = repo.save(clinic);

        onboardingClient.markUsed(Map.of("token", dto.getToken()));
        asyncVerificationService.sendAcknowledgementAsync(saved);

        return saved;
    }

    // =====================================================================
    // VERIFICATION
    // =====================================================================
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
        return clinic;
    }

    // =====================================================================
    // CRUD
    // =====================================================================
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

    // =====================================================================
    // UPDATE CLINIC
    // =====================================================================
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

        if (dto.getOthers() != null) {
            clinic.setOthers(dto.getOthers().stream().map(this::decode).toList());
        }

        // =====================================================================
        // DOCTOR UPDATE WITH DUPLICATE PROTECTION
        // =====================================================================
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

    // =====================================================================
    // DOCTOR DUPLICATE VALIDATION
    // =====================================================================
    private void validateDuplicateDoctors(List<DoctorDTO> doctorsList) {

        // Check duplicate Registration Numbers
        Set<String> regNos = doctorsList.stream()
                .map(DoctorDTO::getRegistrationNumber)
                .collect(Collectors.toSet());

        if (regNos.size() != doctorsList.size()) {
            throw new ProcedureServiceException("Duplicate doctor registrationNumber detected", 400, null);
        }

        // Check duplicate Association Numbers
        Set<String> assocNos = doctorsList.stream()
                .map(DoctorDTO::getAssociationNumber)
                .collect(Collectors.toSet());

        if (assocNos.size() != doctorsList.size()) {
            throw new ProcedureServiceException("Duplicate doctor associationNumber detected", 400, null);
        }

        // ✅ Removed doctorName duplicate check
    }

    // =====================================================================
    // HELPER
    // =====================================================================
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

    // =====================================================================
    // COPY BASIC FIELDS + DOCTOR VALIDATION
    // =====================================================================
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

        // =============================
        // DOCTOR DUPLICATE VALIDATION
        // =============================
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

    // =====================================================================
    // DOCUMENT DECODING
    // =====================================================================
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
                clinic.setOthers(dto.getOthers().stream().map(this::decode).toList());
            }

        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid Base64 document format: " + ex.getMessage());
        }
    }
}
