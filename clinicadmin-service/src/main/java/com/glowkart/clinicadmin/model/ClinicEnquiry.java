package com.glowkart.clinicadmin.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Document(collection = "clinic_enquiries")
@AllArgsConstructor
@NoArgsConstructor
public class ClinicEnquiry {

    @Id
    private String id;

    @NotBlank(message = "Clinic ID is required")
    private String clinicId;

    @NotBlank(message = "Clinic name is required")
    private String clinicName;

    @NotBlank(message = "Clinic address is required")
    private String clinicAddress;

    @NotBlank(message = "Clinic mobile is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid clinic mobile number")
    private String clinicMobile;

    @NotBlank(message = "Contact name is required")
    private String contactName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid contact mobile number")
    private String contactMobile;

    @Email(message = "Invalid email format")
    private String contactEmail;

    @NotBlank(message = "Message is required")
    private String message;

    @CreatedDate
    private Instant createdAt;
}
