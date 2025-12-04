package com.glowkart.procedure.service;

import com.glowkart.procedure.dto.ProcedurePackageDTO;
import java.util.List;

public interface ProcedurePackageService {

    ProcedurePackageDTO create(ProcedurePackageDTO dto);

    List<ProcedurePackageDTO> getByClinic(String clinicId);

    ProcedurePackageDTO getById(String packageId);

    ProcedurePackageDTO updateWithClinic(String packageId, String clinicId, ProcedurePackageDTO dto);

    void deleteWithClinic(String packageId, String clinicId);


    List<ProcedurePackageDTO> getAll();

	ProcedurePackageDTO getByClinicAndPackage(String clinicId, String packageId);
}
