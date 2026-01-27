package com.glowkart.auth.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.glowkart.auth.enums.RewardReason;
import com.glowkart.auth.enums.RewardTransactionType;
import com.glowkart.auth.model.RewardTransaction;

public interface RewardTransactionRepository extends MongoRepository<RewardTransaction, String> {
    List<RewardTransaction> findByMobileOrderByCreatedAtDesc(String mobile);
    List<RewardTransaction> findByMobileAndType(String mobile, RewardTransactionType type);
	boolean existsByCustomerIdAndReason(String customerId, RewardReason registrationCompleted);
}
