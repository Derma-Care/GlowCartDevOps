package com.glowkart.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponseDTO {

    private String code;
    private boolean used;     // true only when registration completed
    private boolean valid;    // true if code exists

    private boolean isRegistrationCodeVerified;
    private boolean isUserProfileCompleted;
    private boolean isSpinWheelCompleted;
    private boolean isRegistrationCompleted;
}
