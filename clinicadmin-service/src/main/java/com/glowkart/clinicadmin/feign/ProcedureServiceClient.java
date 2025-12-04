package com.glowkart.clinicadmin.feign;



import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ProcedurePackageDTO;

@FeignClient(name = "procedure-service", contextId = "procedurePackageClient")
public interface ProcedureServiceClient {

    @PostMapping("/procedures/packages/create")
    ResponseEntity<ApiResponse<ProcedurePackageDTO>> createPackage(
            @RequestBody ProcedurePackageDTO dto);

    @GetMapping("/procedures/packages/{packageId}")
    ResponseEntity<ApiResponse<ProcedurePackageDTO>> getById(
            @PathVariable("packageId") String packageId);

    @GetMapping("/procedures/packages/all")
    ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> getAll();

    @GetMapping("/procedures/packages/clinic/{clinicId}")
    ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> getByClinic(
            @PathVariable("clinicId") String clinicId);

    @GetMapping("/procedures/packages/clinic/{clinicId}/{packageId}")
    ResponseEntity<ApiResponse<ProcedurePackageDTO>> getByClinicAndPackage(
            @PathVariable("clinicId") String clinicId,
            @PathVariable("packageId") String packageId);

 // Update package with clinicId
    @PutMapping("/procedures/packages/update/{packageId}/clinic/{clinicId}")
    ResponseEntity<ApiResponse<ProcedurePackageDTO>> updatePackage(
            @PathVariable("packageId") String packageId,
            @PathVariable("clinicId") String clinicId,
            @RequestBody ProcedurePackageDTO dto);

    // Delete package with clinicId
    @DeleteMapping("/procedures/packages/delete/{packageId}/clinic/{clinicId}")
    ResponseEntity<ApiResponse<Void>> deletePackage(
            @PathVariable("packageId") String packageId,
            @PathVariable("clinicId") String clinicId);

}