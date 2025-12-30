package com.glowkart.admin.repo;

import com.glowkart.admin.model.Clinic;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ClinicRepository extends MongoRepository<Clinic, String> {

    boolean existsByWhatsappNumber(String whatsappNumber);
    
    Clinic findByUsername(String username);
    Clinic findByEmail(String email);
    Clinic findByWhatsappNumber(String whatsappNumber);
    Clinic findByPayoutUsername(String payoutUsername);

    // Fetch clinics by status (case-insensitive)
    List<Clinic> findByStatusIgnoreCase(String status);

    // Fetch clinics by state and status (case-insensitive)
    List<Clinic> findByStateIgnoreCaseAndStatusIgnoreCase(String state, String status);

    // ✅ NEW: fetch clinics by state, status, and online flag
    List<Clinic> findByStateIgnoreCaseAndStatusIgnoreCaseAndOnline(String state, String status, boolean online);
}
