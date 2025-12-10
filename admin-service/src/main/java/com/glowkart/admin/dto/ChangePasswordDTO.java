package com.glowkart.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordDTO {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
