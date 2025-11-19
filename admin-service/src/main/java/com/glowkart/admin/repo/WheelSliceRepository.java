package com.glowkart.admin.repo;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.glowkart.admin.model.WheelSlice;

@Repository
public interface WheelSliceRepository extends MongoRepository<WheelSlice, String> {
}

