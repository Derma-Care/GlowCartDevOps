package com.glowkart.customer.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerDetailsDTO {

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
}
