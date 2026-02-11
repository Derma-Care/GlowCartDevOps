package com.glowkart.admin.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.glowkart.admin.model.ServiceAds;

public interface ServiceAdsRepository extends MongoRepository<ServiceAds, String> {
    // Standard CRUD operations are inherited
	List<ServiceAds> findByClinicId(String clinicId);

}
