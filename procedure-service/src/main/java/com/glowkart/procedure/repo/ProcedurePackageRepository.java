package com.glowkart.procedure.repo;

import com.glowkart.procedure.model.ProcedurePackage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProcedurePackageRepository extends MongoRepository<ProcedurePackage, String> {
    List<ProcedurePackage> findByClinicId(String clinicId);
}
