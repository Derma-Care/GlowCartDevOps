package com.glowkart.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CompleteRegistrationDTO {

    @NotBlank(message = "Address is required")
    @Pattern(
        regexp = ".*\\b\\d{6}\\b.*",
        message = "Address must include a valid 6-digit PIN code"
    )
    private String address;
}
