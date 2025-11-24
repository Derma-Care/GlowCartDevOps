package com.glowkart.clinicadmin.service;

import com.glowkart.clinicadmin.dto.ProcedurePackageDTO;
import java.util.List;

public interface ProcedurePackageService {

    ProcedurePackageDTO create(ProcedurePackageDTO dto);

    ProcedurePackageDTO update(String packageId, ProcedurePackageDTO dto);

    void delete(String packageId);

    ProcedurePackageDTO getById(String packageId);

    List<ProcedurePackageDTO> getAll();

    List<ProcedurePackageDTO> getByClinic(String clinicId);

    ProcedurePackageDTO getByClinicAndPackage(String clinicId, String packageId);
}
