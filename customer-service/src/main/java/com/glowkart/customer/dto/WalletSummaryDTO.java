package com.glowkart.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletSummaryDTO {
    private int totalCredits;
    private int totalDebits;
    private int balance;
    
    // Optional info for frontend
    private boolean registrationRewardGiven;
    private boolean referralRewardGiven;
}
