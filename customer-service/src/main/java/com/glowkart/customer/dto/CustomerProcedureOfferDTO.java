package com.glowkart.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProcedureOfferDTO {

    private String procedureId;
    private String procedureName;
    private int minOffer;
    private int maxOffer;
}
