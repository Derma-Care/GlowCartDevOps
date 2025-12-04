package com.glowkart.admin.client;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ProcedurePackageDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "procedure-service", contextId = "procedurePackageClient")
public interface ProcedurePackageProcedureServiceClient {

    @PostMapping("/procedures/packages/create")
    ApiResponse<ProcedurePackageDTO> createPackage(@RequestBody ProcedurePackageDTO dto);

    @GetMapping("/procedures/packages/{packageId}")
    ApiResponse<ProcedurePackageDTO> getById(@PathVariable String packageId);

    @GetMapping("/procedures/packages/all")
    ApiResponse<List<ProcedurePackageDTO>> getAll();

    @GetMapping("/procedures/packages/clinic/{clinicId}")
    ApiResponse<List<ProcedurePackageDTO>> getByClinic(@PathVariable String clinicId);

    @GetMapping("/procedures/packages/clinic/{clinicId}/{packageId}")
    ApiResponse<ProcedurePackageDTO> getByClinicAndPackage(
            @PathVariable String clinicId,
            @PathVariable String packageId
    );

 // Update package with clinicId
    @PutMapping("/procedures/packages/update/{packageId}/clinic/{clinicId}")
    ApiResponse<ProcedurePackageDTO> updatePackage(
            @PathVariable String packageId,
            @PathVariable String clinicId,
            @RequestBody ProcedurePackageDTO dto);

    // Delete package with clinicId
    @DeleteMapping("/procedures/packages/delete/{packageId}/clinic/{clinicId}")
    ApiResponse<Void> deletePackage(
            @PathVariable String packageId,
            @PathVariable String clinicId);

}
