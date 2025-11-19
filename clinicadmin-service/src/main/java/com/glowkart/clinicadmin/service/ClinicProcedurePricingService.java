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
        return feignClient.getByClinic(clinicId);
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
}
