package com.glowkart.clinicadmin.service;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ProcedurePackageDTO;
import java.util.List;

public interface ProcedurePackageService {

    ProcedurePackageDTO create(ProcedurePackageDTO dto);

    ApiResponse<ProcedurePackageDTO> update(String packageId, ProcedurePackageDTO dto);

    ApiResponse<Void> delete(String packageId, String clinicId);


    ProcedurePackageDTO getById(String packageId);

    List<ProcedurePackageDTO> getAll();

    List<ProcedurePackageDTO> getByClinic(String clinicId);

    ProcedurePackageDTO getByClinicAndPackage(String clinicId, String packageId);
}
