package com.glowkart.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ProcedurePackageDTO;
import com.glowkart.admin.service.ProcedurePackageAdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class ProcedurePackageAdminController {

    private final ProcedurePackageAdminService service;

    @PostMapping("/packages/create")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> createPackage(@RequestBody ProcedurePackageDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Package created successfully", service.createPackage(dto)));
    }

    @PutMapping("/packages/update/{packageId}/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> updatePackage(
            @PathVariable String packageId,
            @PathVariable String clinicId,
            @RequestBody ProcedurePackageDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Package updated successfully",
                service.updatePackage(packageId, clinicId, dto)));
    }

    @DeleteMapping("/packages/delete/{packageId}/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<Void>> deletePackage(
            @PathVariable String packageId,
            @PathVariable String clinicId) {
        service.deletePackage(packageId, clinicId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Package deleted successfully", null));
    }


    @GetMapping("/packages/{packageId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> getById(@PathVariable String packageId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Package fetched successfully", service.getById(packageId)));
    }

    @GetMapping("/packages/all")
    public ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> getAllPackages() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All packages fetched", service.getAllPackages()));
    }

    @GetMapping("/packages/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> getByClinic(@PathVariable String clinicId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Packages fetched for clinic", service.getByClinic(clinicId)));
    }

    @GetMapping("/packages/clinic/{clinicId}/{packageId}")
    public ResponseEntity<ApiResponse<ProcedurePackageDTO>> getByClinicAndPackage(
            @PathVariable String clinicId,
            @PathVariable String packageId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Package fetched for clinic", service.getByClinicAndPackage(clinicId, packageId)));
    }
}
