package com.glowkart.procedure.service;

import com.glowkart.procedure.dto.ProcedureOfferDTO;
import com.glowkart.procedure.dto.ProcedurePricingDTO;

import java.util.List;

public interface ProcedurePricingService {

    ProcedurePricingDTO create(ProcedurePricingDTO dto);

    List<ProcedurePricingDTO> getByClinic(String clinicId);

    ProcedurePricingDTO getByProcedureAndClinic(String procedureId, String clinicId);

    ProcedurePricingDTO update(String procedureId, String clinicId, ProcedurePricingDTO dto);

    void delete(String procedureId, String clinicId);

    List<ProcedurePricingDTO> getAll();
    
    ProcedurePricingDTO getByProcedureId(String procedureId);

	List<ProcedureOfferDTO> getProcedureOffers();

}
