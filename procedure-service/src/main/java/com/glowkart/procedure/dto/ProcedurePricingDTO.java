package com.glowkart.procedure.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.Map;

@Data
public class ProcedurePricingDTO {
    private String procedureId;
    private String procedureName; // auto-fetched
    @NotBlank(message = "Clinic ID is required")
    private String clinicId;

    private String description;
    private String procedureImage;

    private List<Map<String, List<String>>> preProcedureQA;
    private List<Map<String, List<String>>> procedureQA;
    private List<Map<String, List<String>>> postProcedureQA;

    private int sittings; // NEW: number of sittings
    
    private double price;
    private double discountPercentage;
    private double discountAmount;
    private double taxPercentage;
    private double taxAmount;
    private double gst;
    private double gstAmount;
    private double platformFeePercentage;
    private double platformFee;
    private double consultationFee;
    private double discountedCost;
    private double clinicPay;
    private double finalCost;
}
