package com.glowkart.booking.dto;

import java.util.LinkedHashMap;
import java.util.Map;

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

    private int balance;           // Number of points
    private String membership;
    private int coinValue;
    private double balanceValue;

    private Map<String, Integer> levels;

  
}
