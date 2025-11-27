package com.glowkart.admin.dto;

import jakarta.validation.constraints.NotBlank;

public class ClinicRejectionRequest {

    @NotBlank(message = "Reason is required")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
