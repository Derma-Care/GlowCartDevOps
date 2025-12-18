package com.glowkart.procedure.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcedureOfferDTO {
    private String procedureId;
    private String procedureName;
    private int minOffer; // minimum totalDiscountPercentage across all clinics
    private int maxOffer; // maximum totalDiscountPercentage across all clinics
}
