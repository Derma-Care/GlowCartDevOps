package com.glowkart.customer.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CustomerDetailsDTO {

    @NotBlank(message = "fullName is required")
    private String fullName;

    @NotBlank(message = "Mobile Number is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$", message = "mobile must be a valid 10-digit Indian number")
    private String mobile;

    @Email(message = "email must be valid")
    @Pattern(regexp = "^$|^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$", message = "email must be valid")
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

    @NotBlank(message = "aadharNumber is required")
    @Pattern(regexp = "^[0-9]{12}$", message = "aadharNumber must be a valid 12-digit number")
    private String aadharNumber;


    private String prescription;
}

