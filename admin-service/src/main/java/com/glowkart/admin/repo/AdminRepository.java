package com.glowkart.admin.repo;

import com.glowkart.admin.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface AdminRepository extends MongoRepository<Admin, String> {
    Optional<Admin> findByMobileNumber(String mobileNumber);
}