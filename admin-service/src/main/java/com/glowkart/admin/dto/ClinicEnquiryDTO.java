package com.glowkart.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ClinicEnquiryDTO {

	private String id;
    @NotBlank
    private String clinicId;

    @NotBlank
    private String clinicName;

    @NotBlank
    private String clinicAddress;

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$")
    private String clinicMobile;

    @NotBlank
    private String contactName;

    @Pattern(regexp = "^[6-9]\\d{9}$")
    private String contactMobile;

    @Email
    private String contactEmail;

    @NotBlank
    private String message;
}
