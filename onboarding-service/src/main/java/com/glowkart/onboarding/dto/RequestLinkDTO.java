package com.glowkart.onboarding.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RequestLinkDTO {

    @Pattern(regexp = "^\\+?\\d{10,15}$", message = "Invalid phone number")
    private String whatsappNumber;

    @Email(message = "Invalid email address")
    private String email;

    private String name; // Optional user's name

    // At least one field should be provided
    public boolean isValid() {
        return (whatsappNumber != null && !whatsappNumber.isBlank())
                || (email != null && !email.isBlank());
    }
}
