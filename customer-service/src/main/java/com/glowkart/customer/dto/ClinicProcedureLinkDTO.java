package com.glowkart.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClinicProcedureLinkDTO {

    private String clinicId;
    private String clinicName;
    private String city;
    private String state;
}
