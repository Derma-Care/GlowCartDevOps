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
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> create(
            @Valid @RequestBody ProcedurePackageDTO dto) {

        ProcedurePackageDTO created = service.create(dto);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Procedure package created successfully", created)
        );
    }

    @GetMapping("/packages/{packageId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> getById(
            @PathVariable String packageId) {

        ProcedurePackageDTO pkg = service.getById(packageId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Package fetched successfully", pkg)
        );
    }

    @GetMapping("/packages/all")
    public ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> getAll() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "All packages fetched successfully", service.getAll())
        );
    }

    @GetMapping("/packages/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> getByClinic(
            @PathVariable String clinicId) {

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Packages for clinic fetched successfully",
                        service.getByClinic(clinicId))
        );
    }

    @GetMapping("/packages/clinic/{clinicId}/{packageId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> getByClinicAndPackage(
            @PathVariable String clinicId,
            @PathVariable String packageId) {

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Package for clinic fetched successfully",
                        service.getByClinicAndPackage(clinicId, packageId))
        );
    }

 // Update package with clinicId
    @PutMapping("/packages/update/{packageId}/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> update(
            @PathVariable String packageId,
            @PathVariable String clinicId,
            @Valid @RequestBody ProcedurePackageDTO dto) {

        ProcedurePackageDTO updated = service.updateWithClinic(packageId, clinicId, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Procedure package updated successfully", updated));
    }

    // Delete package with clinicId
    @DeleteMapping("/packages/delete/{packageId}/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String packageId,
            @PathVariable String clinicId) {

        service.deleteWithClinic(packageId, clinicId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Procedure package deleted successfully", null));
    }

}
