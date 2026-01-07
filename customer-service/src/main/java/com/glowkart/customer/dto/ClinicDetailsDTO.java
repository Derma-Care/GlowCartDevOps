package com.glowkart.customer.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClinicDetailsDTO {

//    private ClinicPublicDTO clinic;
    private List<ProcedurePackageDTO> packages;
    private List<ProcedurePricingDTO> procedures;

}

