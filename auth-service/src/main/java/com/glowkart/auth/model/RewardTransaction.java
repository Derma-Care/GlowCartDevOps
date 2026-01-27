package com.glowkart.auth.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.glowkart.auth.enums.RewardReason;
import com.glowkart.auth.enums.RewardTransactionType;

import lombok.Data;
@Data
@Document(collection = "reward_transactions")
public class RewardTransaction {

    @Id
    private String id;
    private String customerId;
    private String mobile;
    private Integer points;
    private RewardTransactionType type;
    private RewardReason reason;
    private Integer balanceAfter;
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private String relatedCustomerId; // the new customer who triggered this referral reward

}
