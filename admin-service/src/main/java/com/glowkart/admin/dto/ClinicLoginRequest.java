package com.glowkart.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClinicLoginRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
