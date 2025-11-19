package com.glowkart.admin.repo;

import com.glowkart.admin.model.Clinic;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ClinicRepository extends MongoRepository<Clinic, String> {
    boolean existsByWhatsappNumber(String whatsappNumber);
    Clinic findByUsername(String username);
}
