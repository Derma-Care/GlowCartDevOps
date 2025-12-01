package com.glowkart.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ClinicRegistrationDTO {

    private String clinicId; 

    @NotBlank(message = "Hospital name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Valid onboarding token is required")
    private String token; // Token from onboarding service

    private String whatsappNumber;

    @Email(message = "Invalid email format")
    private String email;

    private double hospitalOverallRating;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
    private String contactNumber;

    @NotBlank(message = "Opening time is required")
    private String openingTime;

    @NotBlank(message = "Closing time is required")
    private String closingTime;

    @NotBlank(message = "Hospital logo (Base64) is required")
    private String hospitalLogo;

    private String website;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "Issuing authority is required")
    private String issuingAuthority;

    @NotNull(message = "Contractor documents must not be null")
    private String contractorDocuments;

    @NotNull(message = "Hospital documents must not be null")
    private String hospitalDocuments;

    private boolean recommended;

    // Registration Certificates
    private String clinicalEstablishmentCertificate;
    private String businessRegistrationCertificate;

    @NotBlank(message = "Clinic type is required")
    private String clinicType; // Proprietorship / Partnership / LLP / Pvt Ltd

    // Medicines Handling
    private String medicinesSoldOnSite;  // Yes / No
    private String drugLicenseCertificate; // Base64
    private String drugLicenseFormType;   // Form 20 or 21

    // Pharmacist info
    private String hasPharmacist; // Yes / No / NA
    private String pharmacistCertificate; // Base64

    // Other Licenses
    private String biomedicalWasteManagementAuth;
    private String tradeLicense;
    private String fireSafetyCertificate;
    private String professionalIndemnityInsurance;
    private String gstRegistrationCertificate;

    private String subscription;

    @NotNull(message = "'Others' documents must not be null")
    private List<String> others;

    private double latitude;
    private double longitude;
    private int nabhScore;
    private String branch;
    private String walkthrough;

    // Clinic admin credentials
    private String role;
    private Map<String, List<String>> permissions;

    private String instagramHandle;
    private String twitterHandle;
    private String facebookHandle;

    private String status; // PENDING / VERIFIED / REJECTED

    // New Fields Added
    private String primaryContactPerson;
    private String designation;
    private String clinicManagementSoftwareUsage; // Yes / No

    @NotBlank(message = "Bank account name is required")
    private String bankAccountName;

    @NotBlank(message = "Bank account number is required")
    private String bankAccountNumber;

    @NotBlank(message = "IFSC code is required")
    private String ifscCode;

    private String upiId; // Optional

    @NotBlank(message = "PAN number is required")
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "PAN number must be in valid format (e.g., ABCDE1234F)")
    private String panNumber;

    private List<DoctorDTO> doctorsList;
}
