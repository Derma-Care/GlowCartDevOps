package com.glowkart.customer.dto;

import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ProcedurePricingDTO {
    private String procedureId;
    private String procedureName;
    @NotBlank(message = "Clinic ID is required")
    private String clinicId;

    private String description;
    private String procedureImage;
    private String procedureLink;

    private List<Map<String, List<String>>> preProcedureQA;
    private List<Map<String, List<String>>> procedureQA;
    private List<Map<String, List<String>>> postProcedureQA;

    private int sittings;
    private String minTime;

    private double price;
    private double discountPercentage;
    private double discountAmount;
    private double taxPercentage;
    private double taxAmount;
    private double gst;
    private double gstAmount;
    private double consultationFee;
    private double platformFeePercentage; // e.g., 2.5%
    private double platformFee; // ✅ NEW — editable from UI
    private double discountedCost;
    private double clinicPay;
    private double finalCost;

    private String offerStart;
    private String offerValidDate;
    private boolean offerActive;
    
    // NEW — NGK admin only
    private double ngkDiscountPercentage;
    private double ngkDiscountAmount;
    
    private double totalDiscountPercentage;
    private double totalDiscountAmount;
 // ✅ NEW
    private double totalDiscountedAmount;
    
    private String paymentType; // FULL_PAYMENT, PARTIAL_PAYMENT
    private double partialPaymentPercentage;
    private double partialAmount;
    private double dueAmount;
}
