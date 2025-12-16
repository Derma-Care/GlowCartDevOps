package com.glowkart.customer.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.glowkart.customer.enums.RewardTransactionType;
import com.glowkart.customer.model.RewardTransaction;

public interface RewardTransactionRepository extends MongoRepository<RewardTransaction, String> {
    List<RewardTransaction> findByMobileOrderByCreatedAtDesc(String mobile);
    List<RewardTransaction> findByMobileAndType(String mobile, RewardTransactionType type);
}
