package com.glowkart.admin.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerResponseDTO {
    private String customerId;
    private String fullName;
    private String mobile;
  
    private String city;
    private LocalDate dob;
    private String gender;
    private Integer serviceStatus;

    // YES fields
    private String clinicName;
    private String clinicCityArea;
    private LocalDate dateOfLastVisit;
    private List<String> serviceType;
    private String prescription;

    // INTERESTED fields
    private String category;
    private List<String> concern;  // updated
    private String skinTone;
    private String photo;

    private String aadharNumber; // Masked only
    private Boolean aadhaarConsent = false;
    private Boolean userConsent = false;
    private Boolean privacyConsent = false;
    
    
    private String blood;
    private String registrationCode;
    private String referBy;
    private Integer registrationRank;
    private String referId;  // This will hold the referId
    // Wheel fields
    private String spinRewardId;
    private String spinRewardValue;
    private String spinRewardImage;

    // Final registration
    private String address;

    // Status flags
    private boolean registrationCodeVerified;
    private boolean isUserProfileCompleted;
    private boolean isSpinWheelCompleted;
    private boolean isRegistrationCompleted;
}
