package com.glowkart.admin.util;

import java.util.Base64;
import java.util.List;

import com.glowkart.admin.dto.ClinicPublicDTO;
import com.glowkart.admin.dto.ClinicRegistrationDTO;
import com.glowkart.admin.dto.ClinicResponse;
import com.glowkart.admin.dto.DoctorDTO;
import com.glowkart.admin.model.Clinic;

public class ClinicMapper {

    public static ClinicPublicDTO toPublicDTO(Clinic clinic) {
        ClinicPublicDTO dto = new ClinicPublicDTO();

        dto.setClinicId(clinic.getClinicId());
        dto.setName(clinic.getName());
        dto.setAddress(clinic.getAddress());
        dto.setCity(clinic.getCity());
        dto.setWhatsappNumber(clinic.getWhatsappNumber());
        dto.setEmail(clinic.getEmail());
        dto.setCreatedAt(clinic.getCreatedAt());

        dto.setStatus(clinic.getStatus());
        dto.setUsername(clinic.getUsername());

        dto.setHospitalOverallRating(clinic.getHospitalOverallRating());
        dto.setContactNumber(clinic.getContactNumber());
        dto.setOpeningTime(clinic.getOpeningTime());
        dto.setClosingTime(clinic.getClosingTime());

        if (clinic.getHospitalLogo() != null) {
            dto.setHospitalLogo(
                "data:image/png;base64," +
                Base64.getEncoder().encodeToString(clinic.getHospitalLogo())
            );
        }

        dto.setWebsite(clinic.getWebsite());
        dto.setLicenseNumber(clinic.getLicenseNumber());
        dto.setIssuingAuthority(clinic.getIssuingAuthority());
        dto.setRecommended(clinic.isRecommended());

        dto.setClinicType(clinic.getClinicType());
        dto.setMedicinesSoldOnSite(clinic.getMedicinesSoldOnSite());
        dto.setDrugLicenseFormType(clinic.getDrugLicenseFormType());
        dto.setHasPharmacist(clinic.getHasPharmacist());

        dto.setSubscription(clinic.getSubscription());
        dto.setLatitude(clinic.getLatitude());
        dto.setLongitude(clinic.getLongitude());
        dto.setOnline(clinic.isOnline()); // ✅ map online status
        // ✅ FIX: STATE MAPPING (THIS WAS MISSING)
        dto.setState(clinic.getState());

        dto.setNabhScore(clinic.getNabhScore());
        dto.setBranch(clinic.getBranch());
        dto.setWalkthrough(clinic.getWalkthrough());

        dto.setRole(clinic.getRole());
        dto.setPermissions(clinic.getPermissions());

        dto.setInstagramHandle(clinic.getInstagramHandle());
        dto.setTwitterHandle(clinic.getTwitterHandle());
        dto.setFacebookHandle(clinic.getFacebookHandle());

        dto.setPrimaryContactPerson(clinic.getPrimaryContactPerson());
        dto.setAlternateContactNumber(clinic.getAlternateContactNumber());
        dto.setDesignation(clinic.getDesignation());
        dto.setClinicManagementSoftwareUsage(clinic.getClinicManagementSoftwareUsage());

        dto.setBankAccountName(clinic.getBankAccountName());
        dto.setBankAccountNumber(clinic.getBankAccountNumber());
        dto.setIfscCode(clinic.getIfscCode());
        dto.setUpiId(clinic.getUpiId());
        dto.setPanNumber(clinic.getPanNumber());

        // -------------------------------
        // Doctor List Mapping
        // -------------------------------
        if (clinic.getDoctorsList() != null) {
            List<DoctorDTO> mappedDoctors = clinic.getDoctorsList()
                .stream()
                .map(doc -> {
                    DoctorDTO d = new DoctorDTO();
                    d.setDoctorName(doc.getDoctorName());
                    d.setRegistrationNumber(doc.getRegistrationNumber());
                    d.setAssociationNumber(doc.getAssociationNumber());
                    d.setAssociationName(doc.getAssociationName());
                    d.setSpecialization(doc.getSpecialization());
                    return d;
                })
                .toList();

            dto.setDoctorsList(mappedDoctors);
        }

        return dto;
    }

    // -------------------------------
    // Map Clinic to ClinicResponse
    // -------------------------------
    public static ClinicResponse toClinicResponse(Clinic clinic) {
        if (clinic == null) return null;

        ClinicResponse response = new ClinicResponse();
        response.setClinicId(clinic.getClinicId());
        response.setName(clinic.getName());
        response.setAddress(clinic.getAddress());
        response.setStatus(clinic.getStatus());

        return response;
    }

    public static ClinicRegistrationDTO toClinicRegistrationDTO(Clinic clinic) {
        if (clinic == null) return null;

        ClinicRegistrationDTO dto = new ClinicRegistrationDTO();

        dto.setClinicId(clinic.getClinicId());
        dto.setName(clinic.getName());
        dto.setAddress(clinic.getAddress());
        dto.setCity(clinic.getCity());
        dto.setState(clinic.getState());
        dto.setToken(clinic.getOnboardingToken()); // maps onboardingToken

        dto.setWhatsappNumber(clinic.getWhatsappNumber());
        dto.setEmail(clinic.getEmail());
        dto.setUsername(clinic.getUsername());
        dto.setHospitalOverallRating(clinic.getHospitalOverallRating());
        dto.setContactNumber(clinic.getContactNumber());
        dto.setOpeningTime(clinic.getOpeningTime());
        dto.setClosingTime(clinic.getClosingTime());

        if (clinic.getHospitalLogo() != null) {
            dto.setHospitalLogo("data:image/png;base64," +
                Base64.getEncoder().encodeToString(clinic.getHospitalLogo()));
        }

        dto.setWebsite(clinic.getWebsite());
        dto.setLicenseNumber(clinic.getLicenseNumber());
        dto.setIssuingAuthority(clinic.getIssuingAuthority());

        if (clinic.getContractorDocuments() != null) {
            dto.setContractorDocuments(Base64.getEncoder().encodeToString(clinic.getContractorDocuments()));
        }
        if (clinic.getHospitalDocuments() != null) {
            dto.setHospitalDocuments(Base64.getEncoder().encodeToString(clinic.getHospitalDocuments()));
        }

        dto.setRecommended(clinic.isRecommended());

        if (clinic.getClinicalEstablishmentCertificate() != null) {
            dto.setClinicalEstablishmentCertificate(Base64.getEncoder().encodeToString(clinic.getClinicalEstablishmentCertificate()));
        }
        if (clinic.getBusinessRegistrationCertificate() != null) {
            dto.setBusinessRegistrationCertificate(Base64.getEncoder().encodeToString(clinic.getBusinessRegistrationCertificate()));
        }

        dto.setClinicType(clinic.getClinicType());
        dto.setMedicinesSoldOnSite(clinic.getMedicinesSoldOnSite());

        if (clinic.getDrugLicenseCertificate() != null) {
            dto.setDrugLicenseCertificate(Base64.getEncoder().encodeToString(clinic.getDrugLicenseCertificate()));
        }
        dto.setDrugLicenseFormType(clinic.getDrugLicenseFormType());

        dto.setHasPharmacist(clinic.getHasPharmacist());
        if (clinic.getPharmacistCertificate() != null) {
            dto.setPharmacistCertificate(Base64.getEncoder().encodeToString(clinic.getPharmacistCertificate()));
        }

        if (clinic.getBiomedicalWasteManagementAuth() != null) {
            dto.setBiomedicalWasteManagementAuth(Base64.getEncoder().encodeToString(clinic.getBiomedicalWasteManagementAuth()));
        }
        if (clinic.getTradeLicense() != null) {
            dto.setTradeLicense(Base64.getEncoder().encodeToString(clinic.getTradeLicense()));
        }
        if (clinic.getFireSafetyCertificate() != null) {
            dto.setFireSafetyCertificate(Base64.getEncoder().encodeToString(clinic.getFireSafetyCertificate()));
        }
        if (clinic.getProfessionalIndemnityInsurance() != null) {
            dto.setProfessionalIndemnityInsurance(Base64.getEncoder().encodeToString(clinic.getProfessionalIndemnityInsurance()));
        }
        if (clinic.getGstRegistrationCertificate() != null) {
            dto.setGstRegistrationCertificate(Base64.getEncoder().encodeToString(clinic.getGstRegistrationCertificate()));
        }

        dto.setSubscription(clinic.getSubscription());

        if (clinic.getOthers() != null) {
            List<String> encodedOthers = clinic.getOthers().stream()
                .map(doc -> Base64.getEncoder().encodeToString(doc))
                .toList();
            dto.setOthers(encodedOthers);
        }

        dto.setLatitude(clinic.getLatitude());
        dto.setLongitude(clinic.getLongitude());
        dto.setNabhScore(clinic.getNabhScore());
        dto.setBranch(clinic.getBranch());
        dto.setWalkthrough(clinic.getWalkthrough());

        dto.setRole(clinic.getRole());
        dto.setPermissions(clinic.getPermissions());

        dto.setInstagramHandle(clinic.getInstagramHandle());
        dto.setTwitterHandle(clinic.getTwitterHandle());
        dto.setFacebookHandle(clinic.getFacebookHandle());

        dto.setStatus(clinic.getStatus());
        dto.setPrimaryContactPerson(clinic.getPrimaryContactPerson());
        dto.setAlternateContactNumber(clinic.getAlternateContactNumber());
        dto.setDesignation(clinic.getDesignation());
        dto.setClinicManagementSoftwareUsage(clinic.getClinicManagementSoftwareUsage());

        dto.setBankAccountName(clinic.getBankAccountName());
        dto.setBankAccountNumber(clinic.getBankAccountNumber());
        dto.setIfscCode(clinic.getIfscCode());
        dto.setUpiId(clinic.getUpiId());
        dto.setPanNumber(clinic.getPanNumber());

        // -------------------------------
        // Doctor List Mapping
        // -------------------------------
        if (clinic.getDoctorsList() != null) {
            List<DoctorDTO> mappedDoctors = clinic.getDoctorsList()
                .stream()
                .map(doc -> {
                    DoctorDTO d = new DoctorDTO();
                    d.setDoctorName(doc.getDoctorName());
                    d.setRegistrationNumber(doc.getRegistrationNumber());
                    d.setAssociationNumber(doc.getAssociationNumber());
                    d.setAssociationName(doc.getAssociationName());
                    d.setSpecialization(doc.getSpecialization());
                    return d;
                })
                .toList();

            dto.setDoctorsList(mappedDoctors);
        }

        return dto;
    }
}
