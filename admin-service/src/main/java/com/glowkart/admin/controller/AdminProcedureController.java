package com.glowkart.admin.controller;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ProcedureDTO;
import com.glowkart.admin.service.ProcedureAdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/admin")
public class AdminProcedureController {

    private final ProcedureAdminService service;

    public AdminProcedureController(ProcedureAdminService service) {
        this.service = service;
    }

    @PostMapping("/procedures/create")
    public ResponseEntity<ApiResponse<ProcedureDTO>> create(@RequestBody ProcedureDTO dto) {
        return ResponseEntity.ok(service.createProcedure(dto));
    }

    @PutMapping("/procedures/update/{procedureId}")
    public ResponseEntity<ApiResponse<ProcedureDTO>> update(
            @PathVariable String procedureId,
            @RequestBody ProcedureDTO dto
    ) {
        return ResponseEntity.ok(service.updateProcedure(procedureId, dto));
    }

    @GetMapping("/procedures/get/{procedureId}")
    public ResponseEntity<ApiResponse<ProcedureDTO>> getById(@PathVariable String procedureId) {
        return ResponseEntity.ok(service.getProcedureById(procedureId));
    }

    @GetMapping("/procedures/all")
    public ResponseEntity<ApiResponse<List<ProcedureDTO>>> getAll() {
        return ResponseEntity.ok(service.getAllProcedures());
    }

    @DeleteMapping("/procedures/delete/{procedureId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String procedureId) {
        return ResponseEntity.ok(service.deleteProcedure(procedureId));
    }
}
