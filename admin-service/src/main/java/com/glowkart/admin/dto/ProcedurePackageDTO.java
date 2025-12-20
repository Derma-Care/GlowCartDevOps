package com.glowkart.admin.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProcedurePackageDTO {

    private String packageId;
    private String packageName;
    private String clinicId;
    private String name;
    private String address;
    private List<ProcedureItemDTO> procedures;
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
    private String offerStart;
    private String offerValidDate;
    private boolean offerActive;
    
    // NEW — NGK Only Fields
    private double ngkDiscountPercentage;
    private double ngkDiscountAmount;
    
    private double totalDiscountPercentage; // clinic + NGK
    private double totalDiscountAmount;     // clinic + NGK

}
