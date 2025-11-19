package com.glowkart.admin.repo;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.glowkart.admin.model.QuetionsAndAnswerForAddClinic;

public interface QuetionsAndAnswerForAddClinicRepository extends MongoRepository<QuetionsAndAnswerForAddClinic, String> {
}
