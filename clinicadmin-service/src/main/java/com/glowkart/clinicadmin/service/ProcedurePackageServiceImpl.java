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
    public ApiResponse<ProcedurePackageDTO> update(String packageId, ProcedurePackageDTO dto) {

        if (dto.getClinicId() == null) {
            throw new IllegalArgumentException("clinicId is required for update");
        }

        ResponseEntity<ApiResponse<ProcedurePackageDTO>> response =
                client.updatePackage(packageId, dto.getClinicId(), dto);

        return response.getBody(); // return full object
    }


    @Override
    public ApiResponse<Void> delete(String packageId, String clinicId) {
        return client.deletePackage(packageId, clinicId).getBody();
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

        ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> response =
                client.getByClinic(clinicId);

        List<ProcedurePackageDTO> data = response.getBody().getData();

        if (data != null) {
            data.forEach(dto -> {

                // ✅ Step 1: Adjust final cost (exclude platform fee)
                double adjustedFinalCost = dto.getFinalCost() - dto.getPlatformFee();
                dto.setFinalCost(adjustedFinalCost);

                // ✅ Step 2: Handle payment types properly
                if ("PARTIAL_PAYMENT".equalsIgnoreCase(dto.getPaymentType())) {

                    double clinicPay = dto.getClinicPay();
                    double percentage = dto.getPartialPaymentPercentage();

                    double partialAmount = (clinicPay * percentage) / 100;
                    double dueAmount = clinicPay - partialAmount;

                    dto.setPartialAmount(Math.round(partialAmount));
                    dto.setDueAmount(Math.round(dueAmount));

                } else if ("FULL_PAYMENT".equalsIgnoreCase(dto.getPaymentType())) {

                    // ✅ No partial payment in full payment
                    dto.setPartialAmount(0);
                    dto.setDueAmount(0);
                }
            });
        }

        return data;
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
