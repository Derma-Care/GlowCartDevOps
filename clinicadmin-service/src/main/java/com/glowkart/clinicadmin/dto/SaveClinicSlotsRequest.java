package com.glowkart.clinicadmin.dto;

import lombok.Data;

import java.util.List;

@Data
public class SaveClinicSlotsRequest {

    private String clinicId;
    private List<ClinicSlotDTO> exceptions;
}
