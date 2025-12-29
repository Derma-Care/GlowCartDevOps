package com.glowkart.booking.dto;

import lombok.Data;

@Data
public class CancelBookingDTO {
    private String bookingId;
    private String reason;
}
