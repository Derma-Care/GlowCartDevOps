package com.glowkart.clinicadmin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class ClinicSlotDetailsDTO {

    private String id;
    private String clinicId;
    private LocalDate date;
    private boolean workingHours;
    private String reason;
}
