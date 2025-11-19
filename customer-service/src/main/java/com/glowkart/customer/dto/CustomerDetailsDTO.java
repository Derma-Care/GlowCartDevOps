package com.glowkart.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDetailsDTO {

    // =================== STEP-1 fields ===================
    @NotBlank
    private String fullName;

    @NotBlank
    private String mobile;

    @Email
    @NotBlank
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

    @NotBlank
    private String aadharNumber;

    private String prescription;

    // =================== STEP-2 fields ===================
//    private String spinRewardId;
//    private String spinRewardValue;
//    private String spinRewardImage;
//
//    private String prizePostScreenshot;
//    private String followScreenshot;
//    private String address;
}
