package com.glowkart.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    @NotBlank(message = "Email or WhatsApp number is required")
    private String identifier; // Email OR WhatsApp number
}
