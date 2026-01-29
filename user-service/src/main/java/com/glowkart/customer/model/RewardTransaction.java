package com.glowkart.customer.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.glowkart.customer.enums.RewardReason;
import com.glowkart.customer.enums.RewardTransactionType;

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
}
