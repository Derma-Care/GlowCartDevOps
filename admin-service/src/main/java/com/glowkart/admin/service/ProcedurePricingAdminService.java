package com.glowkart.admin.service;

import com.glowkart.admin.client.ProcedurePricingProcedureServiceClient;
import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ProcedurePricingDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcedurePricingAdminService {

    private final ProcedurePricingProcedureServiceClient client;

    public ApiResponse<ProcedurePricingDTO> createPricing(ProcedurePricingDTO dto) {
        return client.createPricing(dto);
    }

    public ApiResponse<List<ProcedurePricingDTO>> getPricingByClinic(String clinicId) {
        return client.getPricingByClinic(clinicId);
    }

    public ApiResponse<ProcedurePricingDTO> getPricingByProcedureAndClinic(String procedureId, String clinicId) {
        return client.getPricingByProcedureAndClinic(procedureId, clinicId);
    }

    public ApiResponse<ProcedurePricingDTO> updatePricing(String procedureId, String clinicId, ProcedurePricingDTO dto) {
        return client.updatePricing(procedureId, clinicId, dto);
    }

    public ApiResponse<Void> deletePricing(String procedureId, String clinicId) {
        return client.deletePricing(procedureId, clinicId);
    }

 // New method to fetch procedure pricing by procedureId
    public ApiResponse<ProcedurePricingDTO> getPricingByProcedureId(String procedureId) {
        return client.getPricingByProcedureId(procedureId);
    }

    public ApiResponse<List<ProcedurePricingDTO>> getAllPricing() {
        return client.getAllPricing();
    }
}
