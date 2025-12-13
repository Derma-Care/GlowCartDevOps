package com.glowkart.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PayoutLoginRequest{ 

    @NotBlank(message = "Username is required")
    private String payoutUsername;

    @NotBlank(message = "Password is required")
    private String payoutPassword;
}
