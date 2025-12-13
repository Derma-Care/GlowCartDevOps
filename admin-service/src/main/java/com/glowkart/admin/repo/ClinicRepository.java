package com.glowkart.admin.repo;

import com.glowkart.admin.model.Clinic;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ClinicRepository extends MongoRepository<Clinic, String> {
    boolean existsByWhatsappNumber(String whatsappNumber);
    
    Clinic findByUsername(String username);

    // NEW: fetch clinics by status (case-insensitive)
    List<Clinic> findByStatusIgnoreCase(String string);

    Clinic findByEmail(String email);
    Clinic findByWhatsappNumber(String whatsappNumber);

    // NEW: fetch clinic by payout username
    Clinic findByPayoutUsername(String payoutUsername);
}
