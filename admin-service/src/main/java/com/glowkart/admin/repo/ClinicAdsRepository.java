package com.glowkart.admin.repo;

import java.util.Collection;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.glowkart.admin.model.ClinicAds;

public interface ClinicAdsRepository extends MongoRepository<ClinicAds, String> {

//	Optional<ClinicAds> findByClinicId(String clinicId);
    // Standard CRUD operations
}
