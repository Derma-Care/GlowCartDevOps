package com.glowkart.admin.repo;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.glowkart.admin.model.ClinicAds;

public interface ClinicAdsRepository extends MongoRepository<ClinicAds, String> {
    // Standard CRUD operations
}
