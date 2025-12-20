package com.glowkart.procedure.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "procedure_packages")
public class ProcedurePackage {

    @Id
    private String id;

    private String packageName;
    private String clinicId;
    private String name;
    private String address;

    private List<ProcedureItem> procedures;
    private int sittings;

    private String description;
    private String packageImage;

    private double price;
    private double discountPercentage;
    private double discountAmount;
    private double taxPercentage;
    private double taxAmount;
    private double gst;
    private double gstAmount;

    private Double consultationFee;

    private double discountedCost;
    private double clinicPay;
    private double finalCost;

    // ⭐ NEW OFFER FIELDS ⭐
    private String offerStart;      // ISO date string
    private String offerValidDate;  // ISO date string
    private boolean offerActive;

    // NEW — NGK Only Fields
    private double ngkDiscountPercentage;
    private double ngkDiscountAmount;
    
    private double totalDiscountPercentage; // clinic + NGK
    private double totalDiscountAmount;     // clinic + NGK

    
    private Instant createdAt;
    private Instant updatedAt;
}
