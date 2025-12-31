// BookingPriceResponseDTO.java
package com.glowkart.booking.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class BookingPriceResponseDTO {
    private double originalFinalAmount;
    private int appliedPoints;
    private int maxRedeemablePoints;
    private int availablePoints;
    private double finalAmount;
}

