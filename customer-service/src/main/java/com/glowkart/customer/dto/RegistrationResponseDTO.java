package com.glowkart.customer.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RegistrationResponseDTO {
    private String code;
    private Boolean used;     // true only when registration completed
    private Boolean valid;    // true if code exists
    private Integer rank;     

    private Boolean registrationCodeVerified;
    private Boolean userProfileCompleted;
    private Boolean spinWheelCompleted;
    private Boolean registrationCompleted;

}

