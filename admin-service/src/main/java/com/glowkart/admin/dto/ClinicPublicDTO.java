package com.glowkart.admin.dto;

import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
public class ClinicPublicDTO {

    private String clinicId;
    private String name;
    private String address;
    private String city;
    private String whatsappNumber;
    private String email;
    private Instant createdAt;

    private String status;
    private String username;

    private double hospitalOverallRating;
    private String contactNumber;
    private String openingTime;
    private String closingTime;

    private String hospitalLogo; 

    private String website;
    private String licenseNumber;
    private String issuingAuthority;

    private boolean recommended;

    private String clinicType;
    private String medicinesSoldOnSite;
    private String drugLicenseFormType;

    private String hasPharmacist;
    private String subscription;

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

    private String primaryContactPerson;
    private String designation;
    private String clinicManagementSoftwareUsage;

    private String bankAccountName;
    private String bankAccountNumber;
    private String ifscCode;
    private String upiId;
    private String panNumber;

    private List<DoctorDTO> doctorsList;  // NEW
}
