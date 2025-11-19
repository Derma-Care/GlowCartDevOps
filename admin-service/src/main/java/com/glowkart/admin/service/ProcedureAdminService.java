package com.glowkart.admin.service;

import com.glowkart.admin.client.ProcedureClient;
import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ProcedureDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProcedureAdminService {

    private final ProcedureClient procedureClient;

    public ProcedureAdminService(ProcedureClient procedureClient) {
        this.procedureClient = procedureClient;
    }

    public ProcedureDTO createProcedure(ProcedureDTO dto) {
        ApiResponse<ProcedureDTO> response = procedureClient.createProcedure(dto);
        if (!response.isSuccess()) throw new RuntimeException(response.getMessage());
        return response.getData();
    }

    public ProcedureDTO updateProcedure(String procedureId, ProcedureDTO dto) {
        ApiResponse<ProcedureDTO> response = procedureClient.updateProcedure(procedureId, dto);
        if (!response.isSuccess()) throw new RuntimeException(response.getMessage());
        return response.getData();
    }

    public ProcedureDTO getProcedureById(String procedureId) {
        ApiResponse<ProcedureDTO> response = procedureClient.getProcedureById(procedureId);
        if (!response.isSuccess()) throw new RuntimeException(response.getMessage());
        return response.getData();
    }

    public List<ProcedureDTO> getAllProcedures() {
        ApiResponse<List<ProcedureDTO>> response = procedureClient.getAllProcedures();
        if (!response.isSuccess()) throw new RuntimeException(response.getMessage());
        return response.getData();
    }

    public void deleteProcedure(String procedureId) {
        ApiResponse<Void> response = procedureClient.deleteProcedure(procedureId);
        if (!response.isSuccess()) throw new RuntimeException(response.getMessage());
    }
}
