package com.glowkart.clinicadmin.repo;

import com.glowkart.clinicadmin.model.ClinicSlot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ClinicSlotRepository extends MongoRepository<ClinicSlot, String> {

    List<ClinicSlot> findByClinicIdAndDateBetween(String clinicId, Date startDate, Date endDate);

    List<ClinicSlot> findByClinicId(String clinicId);
}
