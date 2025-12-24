package com.glowkart.customer.service;

import com.glowkart.customer.dto.ClinicProcedureLinkDTO;

import java.util.List;

public interface CustomerClinicSearchService {

    List<ClinicProcedureLinkDTO> findClinicsForProcedure(
            double latitude,
            double longitude,
            String procedureId
    );
}
