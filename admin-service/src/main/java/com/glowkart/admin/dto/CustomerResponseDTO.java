package com.glowkart.admin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CustomerResponseDTO {
    private String customerId;
    private String fullName;
    private String mobile;
    private String email;
    private String city;
    private LocalDate dob;
    private Integer serviceStatus;

    // YES fields
    private String clinicName;
    private String clinicCityArea;
    private LocalDate dateOfLastVisit;
    private List<String> serviceType;
    private String prescription;

    // INTERESTED fields
    private String category;
    private String concern;
    private String skinTone;
    private String photo;

    private String aadharNumber; // Masked only
    private Boolean aadhaarConsent;
    private String blood;
    private String registrationCode;
    private String referBy;

    // Wheel fields
    private String spinRewardId;
    private String spinRewardValue;
    private String spinRewardImage;

    // Final registration
    private String prizePostScreenshot;
    private String followScreenshot;
    private String address;

    // Status flags
    private boolean registrationCodeVerified;
    private boolean isUserProfileCompleted;
    private boolean isSpinWheelCompleted;
    private boolean isRegistrationCompleted;
}
