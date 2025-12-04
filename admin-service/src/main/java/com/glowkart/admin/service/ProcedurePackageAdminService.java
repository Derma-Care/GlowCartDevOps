package com.glowkart.admin.service;

import com.glowkart.admin.client.ProcedurePackageProcedureServiceClient;
import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ProcedurePackageDTO;
import com.glowkart.admin.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcedurePackageAdminService {

    private final ProcedurePackageProcedureServiceClient client;

    public ProcedurePackageDTO createPackage(ProcedurePackageDTO dto) {
        return client.createPackage(dto).getData();
    }

    public ProcedurePackageDTO updatePackage(String packageId, String clinicId, ProcedurePackageDTO dto) {
        return client.updatePackage(packageId, clinicId, dto).getData();
    }

    public void deletePackage(String packageId, String clinicId) {
        client.deletePackage(packageId, clinicId);
    }


    public ProcedurePackageDTO getById(String packageId) {
        ApiResponse<ProcedurePackageDTO> response = client.getById(packageId);
        if (response.getData() == null) {
            throw new ResourceNotFoundException("Package not found");
        }
        return response.getData();
    }

    public List<ProcedurePackageDTO> getAllPackages() {
        return client.getAll().getData();
    }

    public List<ProcedurePackageDTO> getByClinic(String clinicId) {
        return client.getByClinic(clinicId).getData();
    }

    public ProcedurePackageDTO getByClinicAndPackage(String clinicId, String packageId) {
        ApiResponse<ProcedurePackageDTO> response = client.getByClinicAndPackage(clinicId, packageId);
        if (response.getData() == null) {
            throw new ResourceNotFoundException("Package not found for this clinic");
        }
        return response.getData();
    }
}
