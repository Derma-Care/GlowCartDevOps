package com.glowkart.auth.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerDTO {

    private String customerId;
    private String fullName;
    private String mobile;
    private String city;
    private String dob;
    private String gender;
    private String clinicName;
    private String clinicCityArea;
    private String dateOfLastVisit;
    private List<String> serviceType;
    private String prescription;
    private boolean aadhaarConsent;
    private boolean userConsent;
    private boolean privacyConsent;
    private String referId;
    private String address;
    private int rewardPoints;
    private boolean registrationRewardGiven;
    private String deviceToken;
    private boolean registrationCodeVerified;
    private List<String> referredCustomerIds;
    private String aadharNumber;
    private boolean userProfileCompleted;
    private boolean spinWheelCompleted;
    private boolean registrationCompleted;

    // getters & setters
}
