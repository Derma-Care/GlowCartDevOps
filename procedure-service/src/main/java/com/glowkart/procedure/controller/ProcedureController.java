package com.glowkart.procedure.controller;

import com.glowkart.procedure.dto.ApiResponse;
import com.glowkart.procedure.dto.ProcedureDTO;
import com.glowkart.procedure.service.ProcedureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/procedures")
@RequiredArgsConstructor
public class ProcedureController {

    private final ProcedureService service;

    // Create a new procedure
    @PostMapping("/create")
    public ApiResponse<ProcedureDTO> create(@Valid @RequestBody ProcedureDTO dto) {
        ProcedureDTO result = service.create(dto);
        return new ApiResponse<>(true, "Procedure created successfully", result);
    }

    // Get a procedure by ID
    @GetMapping("/get/{procedureId}")
    public ApiResponse<ProcedureDTO> getById(@PathVariable String procedureId) {
        ProcedureDTO dto = service.getById(procedureId);
        return new ApiResponse<>(true, "Procedure fetched successfully", dto);
    }

    // Get all procedures
    @GetMapping("/all")
    public ApiResponse<List<ProcedureDTO>> getAll() {
        List<ProcedureDTO> list = service.getAll();
        return new ApiResponse<>(true, "All procedures fetched", list);
    }

    // Update a procedure
    @PutMapping("/update/{procedureId}")
    public ApiResponse<ProcedureDTO> update(
            @PathVariable String procedureId,
            @Valid @RequestBody ProcedureDTO dto) {
        ProcedureDTO updated = service.update(procedureId, dto);
        return new ApiResponse<>(true, "Procedure updated successfully", updated);
    }

    // Delete a procedure
    @DeleteMapping("/delete/{procedureId}")
    public ApiResponse<Void> delete(@PathVariable String procedureId) {
        service.delete(procedureId);
        return new ApiResponse<>(true, "Procedure deleted successfully", null);
    }
}
