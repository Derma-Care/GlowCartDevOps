package com.glowkart.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WalletSummaryDTO {
    private int totalCredits;
    private int totalDebits;
    private int balance;
}
