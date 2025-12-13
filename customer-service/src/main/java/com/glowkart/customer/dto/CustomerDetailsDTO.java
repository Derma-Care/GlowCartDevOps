package com.glowkart.customer.dto;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerDetailsDTO {

    @NotBlank(message = "fullName is required")
    private String fullName;

    @NotBlank(message = "Mobile Number is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$", message = "mobile must be a valid 10-digit Indian number")
    private String mobile;

    @NotBlank(message = "city is required")   // ✅ ADD THIS
    private String city;
    
    private LocalDate dob;

    @NotBlank(message = "gender is required")  // <-- Gender is now required
    private String gender;

    @NotNull(message = "serviceStatus is required")
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

   
    private String registrationCode;
    private String referBy;

    @NotBlank(message = "aadharNumber is required")
    @Pattern(regexp = "^[0-9]{12}$", message = "aadharNumber must be a valid 12-digit number")
    private String aadharNumber;

    @AssertTrue(message = "Aadhaar consent is required")
    private Boolean aadhaarConsent;
    
    @AssertTrue(message = "User consent is required")
    private Boolean userConsent;

    @AssertTrue(message = "Privacy consent is required")
    private Boolean privacyConsent;
    
}
