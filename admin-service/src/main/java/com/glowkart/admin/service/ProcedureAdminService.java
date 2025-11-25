package com.glowkart.admin.service;

import com.glowkart.admin.client.ProcedureClient;
import com.glowkart.admin.dto.ProcedureDTO;
import com.glowkart.admin.dto.ApiResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProcedureAdminService {

    private final ProcedureClient procedureClient;

    public ProcedureAdminService(ProcedureClient procedureClient) {
        this.procedureClient = procedureClient;
    }

    public ApiResponse<ProcedureDTO> createProcedure(ProcedureDTO dto) {
        return procedureClient.createProcedure(dto);
    }

    public ApiResponse<ProcedureDTO> updateProcedure(String procedureId, ProcedureDTO dto) {
        return procedureClient.updateProcedure(procedureId, dto);
    }

    public ApiResponse<ProcedureDTO> getProcedureById(String procedureId) {
        return procedureClient.getProcedureById(procedureId);
    }

    public ApiResponse<List<ProcedureDTO>> getAllProcedures() {
        return procedureClient.getAllProcedures();
    }

    public ApiResponse<Void> deleteProcedure(String procedureId) {
        return procedureClient.deleteProcedure(procedureId);
    }
}
