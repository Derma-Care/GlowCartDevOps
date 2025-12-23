package com.glowkart.clinicadmin.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AvailableSlotsResponse {

    private List<String> dates;
    private List<ClinicSlotDTO> slots;
}
