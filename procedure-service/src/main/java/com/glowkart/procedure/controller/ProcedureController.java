package com.glowkart.procedure.controller;

import com.glowkart.procedure.dto.ApiResponse;
import com.glowkart.procedure.dto.ProcedureDTO;
import com.glowkart.procedure.service.ProcedureService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/procedures")
public class ProcedureController {

    private final ProcedureService service;

    public ProcedureController(ProcedureService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ProcedureDTO>> create(@RequestBody ProcedureDTO dto) {
        try {
            ProcedureDTO result = service.create(dto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Procedure created successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/update/{procedureId}")
    public ResponseEntity<ApiResponse<ProcedureDTO>> update(
            @PathVariable String procedureId,
            @RequestBody ProcedureDTO dto) {
        try {
            ProcedureDTO result = service.update(procedureId, dto);
            return ResponseEntity.ok(new ApiResponse<>(true, "Procedure updated successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/get/{procedureId}")
    public ResponseEntity<ApiResponse<ProcedureDTO>> getById(@PathVariable String procedureId) {
        try {
            ProcedureDTO result = service.getById(procedureId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Procedure fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ProcedureDTO>>> getAll() {
        List<ProcedureDTO> list = service.getAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "All procedures fetched", list));
    }

    @DeleteMapping("/delete/{procedureId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String procedureId) {
        try {
            service.delete(procedureId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Procedure deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
