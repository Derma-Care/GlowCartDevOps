package com.glowkart.clinicadmin.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.glowkart.clinicadmin.model.ClinicEnquiry;

public interface ClinicEnquiryRepository extends MongoRepository<ClinicEnquiry, String> {

    List<ClinicEnquiry> findByClinicId(String clinicId);
}


