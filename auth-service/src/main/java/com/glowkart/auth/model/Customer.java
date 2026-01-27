package com.glowkart.auth.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.glowkart.auth.dto.WalletSummaryDTO;
import com.glowkart.auth.util.AadhaarUtils;

import lombok.Data;

@Data
@Document(collection = "customers")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Customer {

    @Id
    private String customerId;

    private String fullName;

    @Indexed(unique = true)
    private String mobile;

    private String city;
    private LocalDate dob;
    private Integer serviceStatus;
    private String gender;

    // YES fields
    private String clinicName;
    private String clinicCityArea;
    private LocalDate dateOfLastVisit;
    private List<String> serviceType;
    private String prescription;

    // INTERESTED fields
    private String category;
    private List<String> concern;
    private String skinTone;
    private String photo;

    // Consent fields
    private Boolean aadhaarConsent = false;
    private Boolean userConsent = false;
    private Boolean privacyConsent = false;

    private String registrationCode;
    private String referBy;
    private Integer registrationRank;
    @Indexed(unique = true)
    private String referId;

   
// // For new user
//    private boolean referralRewardGiven = false;
//
//    // For referrer
//    private boolean referralRewardReceived = false;

    
    // Aadhaar
    @JsonIgnore
    @Indexed(unique = true)
    private String aadharHash;

    @JsonIgnore
    private String aadharSalt;

    @JsonIgnore
    private String aadharLast4;

    @JsonIgnore
    @Indexed
    private String aadharPreHash;

    // Wheel fields
    private String spinRewardId;
    private String spinRewardValue;
    private String spinRewardImage;

    // Final registration
    private String address;

 // ==================== REWARD ====================
    private Integer rewardPoints = 0;
    private boolean registrationRewardGiven = false;

    private String deviceToken;
 // FCM tokens

    private boolean registrationCodeVerified = false;
    private boolean isUserProfileCompleted = false;
    private boolean isSpinWheelCompleted = false;
    private boolean isRegistrationCompleted = false;

    
    @Transient // Not stored in DB
    private WalletSummaryDTO walletSummary;
    
 // Add this field to track which referred customers have been rewarded
//    private Set<String> referredCustomerIds = new HashSet<>();
 // For tracking referral rewards
    private List<String> referredCustomerIds = new ArrayList<>();


    public String getAadharNumber() {
        if (aadharLast4 == null) return null;
        return AadhaarUtils.maskAadhaar(aadharLast4);
    }
}
