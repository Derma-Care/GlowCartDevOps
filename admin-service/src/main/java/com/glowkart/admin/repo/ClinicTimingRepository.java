package com.glowkart.admin.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.glowkart.admin.model.ClinicTiming;

public interface ClinicTimingRepository extends MongoRepository<ClinicTiming, String> {

  List<ClinicTiming> findAllByOrderByStartHourAsc();
}
