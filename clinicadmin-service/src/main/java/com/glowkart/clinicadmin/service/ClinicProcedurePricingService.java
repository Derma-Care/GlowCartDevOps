package com.glowkart.clinicadmin.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ProcedurePricingDTO;
import com.glowkart.clinicadmin.feign.ProcedureServiceFeignClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClinicProcedurePricingService {

    private final ProcedureServiceFeignClient feignClient;

    public ApiResponse<ProcedurePricingDTO> create(ProcedurePricingDTO dto) {
        return feignClient.create(dto);
    }

    public ApiResponse<List<ProcedurePricingDTO>> getByClinic(String clinicId) {

        ApiResponse<List<ProcedurePricingDTO>> response =
                feignClient.getByClinic(clinicId);

        if (response.getData() != null) {
            response.getData().forEach(dto -> {

                // ✅ Step 1: Adjust final cost (exclude platform fee)
                double adjustedFinalCost = dto.getFinalCost() - dto.getPlatformFee();
                dto.setFinalCost(adjustedFinalCost);

                // ✅ Step 2: Handle payment types
                if ("PARTIAL_PAYMENT".equalsIgnoreCase(dto.getPaymentType())) {

                    double clinicPay = dto.getClinicPay();
                    double percentage = dto.getPartialPaymentPercentage();

                    double partialAmount = (clinicPay * percentage) / 100;
                    double dueAmount = clinicPay - partialAmount;

                    dto.setPartialAmount(Math.round(partialAmount));
                    dto.setDueAmount(Math.round(dueAmount));

                } else if ("FULL_PAYMENT".equalsIgnoreCase(dto.getPaymentType())) {

                    // ✅ No partial payment in full payment mode
                    dto.setPartialAmount(0);
                    dto.setDueAmount(0);
                }
            });
        }

        return response;
    }


    public ApiResponse<ProcedurePricingDTO> getByProcedureAndClinic(String procedureId, String clinicId) {
        return feignClient.getByProcedureAndClinic(procedureId, clinicId);
    }

    public ApiResponse<ProcedurePricingDTO> update(String procedureId, String clinicId, ProcedurePricingDTO dto) {
        return feignClient.update(procedureId, clinicId, dto);
    }

    public ApiResponse<Void> delete(String procedureId, String clinicId) {
        return feignClient.delete(procedureId, clinicId);
    }
    
 // New method to fetch procedure pricing by procedureId
    public ApiResponse<ProcedurePricingDTO> getByProcedureId(String procedureId) {
        return feignClient.getByProcedureId(procedureId);
    }

    // New method to call Feign Client's getAll() to fetch all procedure pricing data
    public ApiResponse<List<ProcedurePricingDTO>> getAllProcedurePricing() {
        return feignClient.getAll();
    }
}
