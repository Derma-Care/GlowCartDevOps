package com.glowkart.clinicadmin.controller;

import com.glowkart.clinicadmin.dto.ProcedurePackageDTO;
import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.service.ProcedurePackageService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clinic-admin")
@RequiredArgsConstructor
public class ProcedurePackageController {

    private final ProcedurePackageService service;

    // CREATE PACKAGE
    @PostMapping("/packages/create")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> create(@RequestBody ProcedurePackageDTO dto) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Package created successfully", service.create(dto))
        );
    }

    // UPDATE PACKAGE
    @PutMapping("/packages/update/{packageId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> update(
            @PathVariable String packageId,
            @RequestBody ProcedurePackageDTO dto) {

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Package updated successfully", service.update(packageId, dto))
        );
    }

    // DELETE PACKAGE
    @DeleteMapping("/packages/delete/{packageId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String packageId) {
        service.delete(packageId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Package deleted successfully", null)
        );
    }

    // GET PACKAGE BY ID
    @GetMapping("/packages/{packageId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> getById(@PathVariable String packageId) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Package fetched successfully", service.getById(packageId))
        );
    }

    // GET ALL PACKAGES
    @GetMapping("/packages/all")
    public ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> getAll() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "All packages fetched", service.getAll())
        );
    }

    // GET ALL PACKAGES BY CLINIC
    @GetMapping("/packages/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> getByClinic(@PathVariable String clinicId) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Packages fetched for clinic", service.getByClinic(clinicId))
        );
    }

    // GET PACKAGE BY CLINIC + PACKAGE ID
    @GetMapping("/packages/clinic/{clinicId}/{packageId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> getByClinicAndPackage(
            @PathVariable String clinicId,
            @PathVariable String packageId) {

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Package fetched for clinic", service.getByClinicAndPackage(clinicId, packageId))
        );
    }
}
