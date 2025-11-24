package com.glowkart.procedure.service;

import com.glowkart.procedure.dto.ProcedurePackageDTO;
import java.util.List;

public interface ProcedurePackageService {

    ProcedurePackageDTO create(ProcedurePackageDTO dto);

    List<ProcedurePackageDTO> getByClinic(String clinicId);

    ProcedurePackageDTO getById(String packageId);

    ProcedurePackageDTO update(String packageId, ProcedurePackageDTO dto);

    void delete(String packageId);

    List<ProcedurePackageDTO> getAll();

	ProcedurePackageDTO getByClinicAndPackage(String clinicId, String packageId);
}
