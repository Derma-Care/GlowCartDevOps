package com.glowkart.customer.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RewardTransactionDTO {
    private String id;
    private int points;
    private String type;
    private String reason;
    private int balanceAfter;
    private LocalDateTime createdAt;
}
