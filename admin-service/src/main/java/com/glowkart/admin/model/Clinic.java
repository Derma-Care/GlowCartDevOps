package com.glowkart.admin.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "clinics")
public class Clinic {

    @Id
    private String clinicId;

    private String name;
    private String address;
    private String city;
    private String whatsappNumber;
    private String email;
    private Instant createdAt;

    private String status; // PENDING / VERIFIED / REJECTED

    private String username; // Clinic login username
    private String password; // Clinic login password

    
    private String payoutUsername;
    private String payoutPassword;

    private double hospitalOverallRating;
    private String contactNumber;
    private String openingTime;
    private String closingTime;
    private byte[] hospitalLogo;
    private String website;
    private String licenseNumber;
    private String issuingAuthority;
    private byte[] contractorDocuments;
    private byte[] hospitalDocuments;
    private boolean recommended;

    // Registration Certificates
    private byte[] clinicalEstablishmentCertificate;
    private byte[] businessRegistrationCertificate;

    private String clinicType;
    private String medicinesSoldOnSite; // Yes / No
    private byte[] drugLicenseCertificate;
    private String drugLicenseFormType;

    private String hasPharmacist; // Yes / No / NA
    private byte[] pharmacistCertificate;

    private byte[] biomedicalWasteManagementAuth;
    private byte[] tradeLicense;
    private byte[] fireSafetyCertificate;
    private byte[] professionalIndemnityInsurance;
    private byte[] gstRegistrationCertificate;

    private String subscription;
    private List<byte[]> others;

    private double latitude;
    private double longitude;
    private int nabhScore;
    private String branch;
    private String walkthrough;

    private String role;
    private Map<String, List<String>> permissions;

    private String instagramHandle;
    private String twitterHandle;
    private String facebookHandle;

    private String onboardingToken; // Token from onboarding service

    // New Fields Added
    private String primaryContactPerson;
    private String designation;
    private String clinicManagementSoftwareUsage; // Yes / No

    private String bankAccountName;
    private String bankAccountNumber;
    private String ifscCode;
    private String upiId; // Optional
    private String panNumber;
    
    private String otpCode;          // Hashed OTP
    private Instant otpExpiry;       // OTP expiry time
    private Instant otpSentTime;     // Last OTP sent time
    private int otpAttempts;         // Count of OTP verification attempts

    private String payoutOtpCode;
    private Instant payoutOtpExpiry;
    private Instant payoutOtpSentTime;
    private int payoutOtpAttempts;

 // Add THIS:
    private List<Doctor> doctorsList;
}
