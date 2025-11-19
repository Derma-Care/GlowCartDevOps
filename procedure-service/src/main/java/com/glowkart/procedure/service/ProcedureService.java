package com.glowkart.procedure.service;

import com.glowkart.procedure.dto.ProcedureDTO;

import java.util.List;

public interface ProcedureService {

    ProcedureDTO create(ProcedureDTO dto);

    ProcedureDTO update(String procedureId, ProcedureDTO dto);

    ProcedureDTO getById(String procedureId);

    List<ProcedureDTO> getAll();

    void delete(String procedureId);
}
