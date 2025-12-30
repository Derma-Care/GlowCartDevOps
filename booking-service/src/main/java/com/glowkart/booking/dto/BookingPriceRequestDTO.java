// BookingPriceRequestDTO.java
package com.glowkart.booking.dto;

import lombok.Data;

@Data
public class BookingPriceRequestDTO {
    private String customerId;
    private String clinicId;
    private String serviceId;
    private String serviceType; // PROCEDURE or PACKAGE
    private int pointsToRedeem;
}
