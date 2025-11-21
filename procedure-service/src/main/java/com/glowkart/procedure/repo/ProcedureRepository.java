package com.glowkart.procedure.repo;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.glowkart.procedure.model.Procedure;

public interface ProcedureRepository extends MongoRepository<Procedure, String> {

    boolean existsByProcedureName(String procedureName);

    boolean existsByProcedureNameIgnoreCase(String procedureName);
}
