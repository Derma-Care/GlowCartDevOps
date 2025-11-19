package com.glowkart.clinicadmin.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.util.List;

@Data
public class DoctorDTO {

    private String doctorId;

    @NotBlank(message = "Clinic ID is required")
    private String clinicId;

    @NotBlank(message = "Doctor name is required")
    private String doctorName;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "Gender is required")
    private String gender;

    @Min(value = 0, message = "Experience cannot be negative")
    private int experience;

    private String qualification;
    private String specialization;
    private String profileDescription;
    private String profilePictureUrl;

    @NotBlank(message = "Procedure ID is required")
    private String procedureId;

    private String procedureName;

    @NotBlank(message = "Start day is required")
    private String startDay;

    @NotBlank(message = "End day is required")
    private String endDay;

    @NotBlank(message = "Start time is required")
    private String startTime;

    @NotBlank(message = "End time is required")
    private String endTime;

    @Pattern(regexp = "\\d{10}", message = "Invalid phone number")
    private String contactNumber;

    @Email(message = "Invalid email")
    private String email;

    private List<String> expertise;
    private List<String> languages;
    private List<String> achievements;
}
