package com.glowkart.procedure.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "procedure_pricing")
public class ProcedurePricing {
    @Id
    private String id;

    private String procedureId;
    private String procedureName; // auto-fetched from Procedure master
    private String clinicId;

    private String description;
    private String procedureImage;
    private String procedureLink; // NEW field

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
    private double discountedCost;
    private double clinicPay;
    private double finalCost;

    private String offerStart;
    private String offerValidDate;
    private boolean offerActive;
    

    // NEW — NGK Only Fields
    private double ngkDiscountPercentage;
    private double ngkDiscountAmount;
    
    private double totalDiscountPercentage; // clinic + NGK
    private double totalDiscountAmount;     // clinic + NGK


    private Instant createdAt;
    private Instant updatedAt;
}
