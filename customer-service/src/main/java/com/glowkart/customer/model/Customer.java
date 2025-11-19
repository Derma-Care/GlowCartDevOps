package com.glowkart.customer.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "customers")
public class Customer {

    @Id
    private String customerId;

    private String fullName;

    @Indexed(unique = true)
    private String mobile;

    @Indexed(unique = true)
    private String email;

    private String city;
    private LocalDate dob;

    private String clinicName;
    private String clinicCityArea;
    private LocalDate dateOfLastVisit;
    private String serviceType;
    private String blood;

    private String registrationCode;
    private String referBy;

    @Indexed(unique = true)
    private String aadharNumber;

    private String prescription;

    // ⭐ NEW FIELDS — Wheel Spin reward
    private String spinRewardId;
    private String spinRewardValue;
    private String spinRewardImage;

    // ⭐ NEW FIELDS — Final registration
    private String prizePostScreenshot;
    private String followScreenshot;
    private String address;

    // ⭐ RegistrationStatus (false on step 1, true on step 2)
    private boolean registrationStatus = false;
}
