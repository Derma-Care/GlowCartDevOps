package com.glowkart.procedure.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.glowkart.procedure.model.ProcedurePackage;

public interface ProcedurePackageRepository extends MongoRepository<ProcedurePackage, String> {
    List<ProcedurePackage> findByClinicId(String clinicId);

    Optional<ProcedurePackage> findById(String id);

}
