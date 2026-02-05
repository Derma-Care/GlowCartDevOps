package com.glowkart.booking.dto;

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
    private int coinValue;         // Value of one point in currency units (pre-calculated)
    private String membership;     // BASIC, SILVER, GOLD, PLATINUM
    private double balanceValue;   // Total currency value = balance * coinValue

    // Optional helper to recalculate balanceValue
    public void calculateDerivedFields() {
        this.balance = totalCredits - totalDebits;
        this.coinValue = coinValue > 0 ? coinValue : 1;
        this.balanceValue = balance * coinValue;
    }
}
