package com.glowkart.customer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SpinWheelDTO {

    @NotBlank
    private String rewardId;
}
