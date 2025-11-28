package com.glowkart.customer.model;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.glowkart.customer.util.AadhaarUtils;

import lombok.Data;

@Data
@Document(collection = "customers")
public class Customer {

    @Id
    private String customerId;

    private String fullName;

    @Indexed(unique = true)
    private String mobile;

    private String email;
    private String city;
    private LocalDate dob;
    private String clinicName;
    private String clinicCityArea;
    private LocalDate dateOfLastVisit;
    private List<String> serviceType;
    private String blood;
    private String registrationCode;
    private String referBy;

    // Aadhaar Storage (Secure)
    @JsonIgnore
    @Indexed(unique = true)
    private String aadharHash;     // SHA-256 hash stored securely

    @JsonIgnore
    private String aadharLast4;    // last 4 digits only, hidden from API

    private String prescription;

    // Wheel Spin Reward
    private String spinRewardId;
    private String spinRewardValue;
    private String spinRewardImage;

    // Final Registration
    private String prizePostScreenshot;
    private String followScreenshot;
    private String address;

    // Step Flags
    private boolean registrationCodeVerified = false;
    private boolean isUserProfileCompleted = false;   
    private boolean isSpinWheelCompleted = false;     
    private boolean isRegistrationCompleted = false;  

    // ================== UPDATED FIELD NAME ==================
    // API will now return: "aadharNumber": "********3812"
    public String getAadharNumber() {
        return AadhaarUtils.maskAadhaar(this.aadharLast4);
    }
}
