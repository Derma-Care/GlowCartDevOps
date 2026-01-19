package com.glowkart.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcedurePricingDTO {

    private String procedureId;
    private String procedureName;

    private double price;

    private double discount;
    private double discountAmount;

    private double taxPercentage;
    private double taxAmount;

    private double gst;
    private double gstAmount;

    private double consultationFee;

    private double finalCost;

    private double totalDiscountAmount;
    private double totalDiscountPercentage;

    private double ngkDiscountAmount;
    private double ngkDiscountPercentage;

    // 🔥 NEW PAYMENT FIELDS
    private String paymentType; // FULL_PAYMENT / PARTIAL_PAYMENT
    private double partialPaymentPercentage;
    private double partialAmount;
    private double dueAmount;
}
