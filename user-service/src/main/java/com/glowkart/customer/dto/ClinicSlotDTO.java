package com.glowkart.customer.dto;

import lombok.Data;

@Data
public class ClinicSlotDTO {

    private String date; // "YYYY-MM-DD"
    private String dayOfWeek;       // NEW: store day while saving
    private Boolean workingHours;
    private String reason;
}
