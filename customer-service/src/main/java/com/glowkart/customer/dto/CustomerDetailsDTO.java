package com.glowkart.customer.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private List<String> serviceType;
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
