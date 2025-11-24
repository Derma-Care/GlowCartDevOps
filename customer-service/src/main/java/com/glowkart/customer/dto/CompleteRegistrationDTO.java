package com.glowkart.customer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompleteRegistrationDTO {

    @NotBlank
    private String prizePostScreenshot;

    @NotBlank
    private String followScreenshot;

    @NotBlank
    private String address;
}
