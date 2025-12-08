package com.glowkart.admin.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
public class ProcedurePricingDTO {
    private String procedureId;
    private String procedureName;
    private String clinicId;

    private String description;
    private String procedureImage;
    private String procedureLink;
    private List<Map<String, List<String>>> preProcedureQA;
    private List<Map<String, List<String>>> procedureQA;
    private List<Map<String, List<String>>> postProcedureQA;
    
    private int sittings;
    private String minTime; // NEW


    private double price;
    private double discountPercentage;
    private double discountAmount;
    private double taxPercentage;
    private double taxAmount;
    private double gst;
    private double gstAmount;
    private double consultationFee;
    private double discountedCost;
    private double clinicPay;
    private double finalCost;

    private String offerStart;      // <-- frontend sends ISO string
    private String offerValidDate;  // <-- frontend sends ISO string
    private boolean offerActive;    // NEW

    // NEW — NGK admin only
    private double ngkDiscountPercentage;
    private double ngkDiscountAmount;
    
    private double totalDiscountPercentage;
    private double totalDiscountAmount;
}
