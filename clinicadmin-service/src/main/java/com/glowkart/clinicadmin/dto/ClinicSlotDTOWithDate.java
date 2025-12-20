package com.glowkart.clinicadmin.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ClinicSlotDTOWithDate {
    private LocalDate date;
    private Boolean workingHours;
    private String reason;
}

