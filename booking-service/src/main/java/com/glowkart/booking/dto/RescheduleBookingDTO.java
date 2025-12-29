package com.glowkart.booking.dto;

import lombok.Data;

@Data
public class RescheduleBookingDTO {
    private String bookingId;
    private String newAppointmentDate; // yyyy-MM-dd
}
