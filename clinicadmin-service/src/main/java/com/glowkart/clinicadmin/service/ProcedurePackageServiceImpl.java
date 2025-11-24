package com.glowkart.clinicadmin.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ProcedurePackageDTO;
import com.glowkart.clinicadmin.exception.ResourceNotFoundException;
import com.glowkart.clinicadmin.feign.ProcedureServiceClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProcedurePackageServiceImpl implements ProcedurePackageService {

    private final ProcedureServiceClient client;

    @Override
    public ProcedurePackageDTO create(ProcedurePackageDTO dto) {
        ResponseEntity<ApiResponse<ProcedurePackageDTO>> response = client.createPackage(dto);
        return response.getBody().getData();
    }

    @Override
    public ProcedurePackageDTO update(String packageId, ProcedurePackageDTO dto) {
        ResponseEntity<ApiResponse<ProcedurePackageDTO>> response = client.updatePackage(packageId, dto);
        return response.getBody().getData();
    }

    @Override
    public void delete(String packageId) {
        client.deletePackage(packageId);
    }

    @Override
    public ProcedurePackageDTO getById(String packageId) {
        ResponseEntity<ApiResponse<ProcedurePackageDTO>> response = client.getById(packageId);

        ApiResponse<ProcedurePackageDTO> body = response.getBody();

        if (body == null || body.getData() == null) {
            throw new ResourceNotFoundException("PACKAGE_NOT_FOUND", "Package not found");
        }

        return body.getData();
    }

    @Override
    public List<ProcedurePackageDTO> getByClinic(String clinicId) {
        ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> response = client.getByClinic(clinicId);
        return response.getBody().getData();
    }

    @Override
    public List<ProcedurePackageDTO> getAll() {
        ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> response = client.getAll();
        return response.getBody().getData();
    }

    @Override
    public ProcedurePackageDTO getByClinicAndPackage(String clinicId, String packageId) {
        ResponseEntity<ApiResponse<ProcedurePackageDTO>> response =
                client.getByClinicAndPackage(clinicId, packageId);

        ApiResponse<ProcedurePackageDTO> body = response.getBody();

        if (body == null || body.getData() == null) {
            throw new ResourceNotFoundException("PACKAGE_NOT_FOUND", "Package not found for this clinic");
        }

        return body.getData();
    }
}
