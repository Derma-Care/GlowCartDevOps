package com.glowkart.admin.repo;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.glowkart.admin.model.RegistrationCode;

public interface RegistrationCodeRepository extends MongoRepository<RegistrationCode, String> {
    RegistrationCode findByCode(String code);
    boolean existsByCode(String code);
}
