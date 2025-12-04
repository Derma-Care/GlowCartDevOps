package com.glowkart.procedure.repo;

import com.glowkart.procedure.model.ProcedurePricing;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProcedurePricingRepository extends MongoRepository<ProcedurePricing, String> {
    List<ProcedurePricing> findByClinicId(String clinicId);
    Optional<ProcedurePricing> findByProcedureIdAndClinicId(String procedureId, String clinicId);
    boolean existsByProcedureIdAndClinicId(String procedureId, String clinicId);
    void deleteByProcedureIdAndClinicId(String procedureId, String clinicId);
	List<ProcedurePricing> findByProcedureId(String procedureId);
}
