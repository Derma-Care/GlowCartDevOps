package com.glowkart.clinicadmin.repo;

import com.glowkart.clinicadmin.model.ClinicSlot;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ClinicSlotRepository extends MongoRepository<ClinicSlot, String> {

    Optional<ClinicSlot> findByClinicIdAndDate(String clinicId, String date);

    List<ClinicSlot> findByClinicIdAndDateIn(String clinicId, List<String> dates);
}
