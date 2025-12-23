package com.glowkart.clinicadmin.dto;

import lombok.Data;

@Data
public class ClinicSlotDTO {

    private String date; // "YYYY-MM-DD"
    private Boolean workingHours;
    private String reason;
}
