package com.glowkart.procedure.controller;

import com.glowkart.procedure.dto.ApiResponse;
import com.glowkart.procedure.dto.ProcedurePackageDTO;
import com.glowkart.procedure.service.ProcedurePackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/procedures")
@RequiredArgsConstructor
public class ProcedurePackageController {

    private final ProcedurePackageService service;

    @PostMapping("/packages/create")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> create(@Valid @RequestBody ProcedurePackageDTO dto) {
        ProcedurePackageDTO created = service.create(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Procedure package created successfully", created));
    }

    @GetMapping("/packages/{packageId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> getById(@PathVariable String packageId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Package fetched successfully", service.getById(packageId)));
    }

    @GetMapping("/packages/all")
    public ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All packages fetched successfully", service.getAll()));
    }

    @GetMapping("/packages/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> getByClinic(@PathVariable String clinicId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Packages for clinic fetched successfully", service.getByClinic(clinicId)));
    }

    @GetMapping("/packages/clinic/{clinicId}/{packageId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> getByClinicAndPackage(
            @PathVariable String clinicId,
            @PathVariable String packageId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Package for clinic fetched successfully",
                service.getByClinicAndPackage(clinicId, packageId)));
    }

    @PutMapping("/packages/update/{packageId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> update(@PathVariable String packageId,
                                                                   @Valid @RequestBody ProcedurePackageDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Procedure package updated successfully",
                service.update(packageId, dto)));
    }

    @DeleteMapping("/packages/delete/{packageId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String packageId) {
        service.delete(packageId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Procedure package deleted successfully", null));
    }
}
