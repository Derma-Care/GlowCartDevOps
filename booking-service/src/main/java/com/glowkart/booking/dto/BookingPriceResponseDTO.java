// BookingPriceResponseDTO.java
package com.glowkart.booking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingPriceResponseDTO {
    private double originalFinalAmount; // final amount before coins applied
    private int appliedPoints;           // points actually applied
    private double finalAmount;          // final amount after points applied
}
