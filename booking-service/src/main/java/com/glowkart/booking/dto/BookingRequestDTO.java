package com.glowkart.booking.dto;

import lombok.Data;

@Data
public class BookingRequestDTO {
    private String customerId;
    private String clinicId;
    private String serviceId;       // can be procedureId or packageId
    private String serviceType;     // "PROCEDURE" or "PACKAGE"

    private String paymentMode;     // "ONLINE" or "CASH"
    private String paymentType;     // "FULL_PAYMENT" or "PARTIAL_PAYMENT"

    private String appointmentDate; // yyyy-MM-dd

    // NEW: Points user wants to redeem
    private int pointsToRedeem;
}
