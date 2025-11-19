package com.glowkart.admin.controller;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ProcedureDTO;
import com.glowkart.admin.service.ProcedureAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AdminProcedureController {

    private final ProcedureAdminService service;

    public AdminProcedureController(ProcedureAdminService service) {
        this.service = service;
    }

    @PostMapping("/procedures/create")
    public ResponseEntity<ApiResponse<ProcedureDTO>> create(@RequestBody ProcedureDTO dto) {
        try {
            ProcedureDTO result = service.createProcedure(dto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Procedure created successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/procedures/update/{procedureId}")
    public ResponseEntity<ApiResponse<ProcedureDTO>> update(
            @PathVariable String procedureId,
            @RequestBody ProcedureDTO dto
    ) {
        try {
            ProcedureDTO result = service.updateProcedure(procedureId, dto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Procedure updated successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/procedures/get/{procedureId}")
    public ResponseEntity<ApiResponse<ProcedureDTO>> getById(@PathVariable String procedureId) {
        try {
            ProcedureDTO result = service.getProcedureById(procedureId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Procedure fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/procedures/all")
    public ResponseEntity<ApiResponse<List<ProcedureDTO>>> getAll() {
        List<ProcedureDTO> list = service.getAllProcedures();
        return ResponseEntity.ok(new ApiResponse<>(true, "All procedures fetched", list));
    }

    @DeleteMapping("/procedures/delete/{procedureId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String procedureId) {
        try {
            service.deleteProcedure(procedureId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Procedure deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
