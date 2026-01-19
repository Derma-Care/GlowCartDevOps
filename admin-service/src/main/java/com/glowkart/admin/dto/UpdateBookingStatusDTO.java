package com.glowkart.admin.dto;


import lombok.Data;

@Data
public class UpdateBookingStatusDTO {
    private String bookingId;
    private String status; // e.g., "COMPLETED", "IN_PROGRESS", "CANCELLED"
}
