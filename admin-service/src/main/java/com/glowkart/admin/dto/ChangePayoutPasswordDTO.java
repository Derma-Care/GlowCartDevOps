package com.glowkart.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePayoutPasswordDTO { 

    @NotBlank(message = "Payout username is required")
    private String payoutUsername;

    @NotBlank(message = "Current payout password is required")
    private String currentPayoutPassword;

    @NotBlank(message = "New payout password is required")
    private String newPayoutPassword;

    @NotBlank(message = "Confirm payout password is required")
    private String confirmPayoutPassword;
}
