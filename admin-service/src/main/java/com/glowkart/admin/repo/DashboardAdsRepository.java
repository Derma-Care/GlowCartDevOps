package com.glowkart.admin.repo;


import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.glowkart.admin.model.DashboardAds;




public interface DashboardAdsRepository extends MongoRepository<DashboardAds, String> {
    List<DashboardAds> findByType(String type);
}

