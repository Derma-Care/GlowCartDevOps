package com.glowkart.admin.util;

import com.glowkart.admin.dto.ClinicPublicDTO;
import com.glowkart.admin.model.Clinic;

import java.util.Base64;

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

        // Only logo included → Base64 encode
        if (clinic.getHospitalLogo() != null) {
            dto.setHospitalLogo("data:image/png;base64," 
                 + Base64.getEncoder().encodeToString(clinic.getHospitalLogo()));
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
        dto.setNabhScore(clinic.getNabhScore());
        dto.setBranch(clinic.getBranch());
        dto.setWalkthrough(clinic.getWalkthrough());

        dto.setRole(clinic.getRole());
        dto.setPermissions(clinic.getPermissions());

        dto.setInstagramHandle(clinic.getInstagramHandle());
        dto.setTwitterHandle(clinic.getTwitterHandle());
        dto.setFacebookHandle(clinic.getFacebookHandle());

        dto.setPrimaryContactPerson(clinic.getPrimaryContactPerson());
        dto.setDesignation(clinic.getDesignation());
        dto.setClinicManagementSoftwareUsage(clinic.getClinicManagementSoftwareUsage());

        dto.setBankAccountName(clinic.getBankAccountName());
        dto.setBankAccountNumber(clinic.getBankAccountNumber());
        dto.setIfscCode(clinic.getIfscCode());
        dto.setUpiId(clinic.getUpiId());
        dto.setPanNumber(clinic.getPanNumber());

        return dto;
    }
}
