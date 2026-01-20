package com.glowkart.procedure.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "procedure_pricing")
public class ProcedurePricing {
    @Id
    private String id;

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
    private String minTime;

    private double price;
    private double discountPercentage;
    private double discountAmount;
    private double taxPercentage;
    private double taxAmount;
    private double gst;
    private double gstAmount;
    private double consultationFee;

//    @Transient
//    private double platformFee; // dynamically calculated, not persisted

    private double discountedCost;
    private double clinicPay;
    private double finalCost;

    private String offerStart;
    private String offerValidDate;
    private boolean offerActive;
    
    private double ngkDiscountPercentage;
    private double ngkDiscountAmount;
    
    private double totalDiscountPercentage;
    private double totalDiscountAmount;
    private double totalDiscountedAmount;

    private Instant createdAt;
    private Instant updatedAt;
    private String paymentType;
    private double partialPaymentPercentage;
    private double dueAmount;
    private double partialAmount;
}
