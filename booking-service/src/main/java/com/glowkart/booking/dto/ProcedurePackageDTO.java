package com.glowkart.booking.dto;

import java.util.List;

import lombok.Data;

@Data
public class ProcedurePackageDTO {

    private String packageId;
    private String packageName;
    private String clinicId;

    private double price;
    // ✅ ADD THIS
    private List<BookingProcedureDTO> procedures;

    // Discount fields
    private double discountAmount;
    private double discountPercentage;
    private double discountedCost;

    private double totalDiscountAmount;
    private double totalDiscountPercentage;

    private double ngkDiscountAmount;
    private double ngkDiscountPercentage;

    // Tax & Fees
    private double taxPercentage;
    private double taxAmount;
    private double gst;
    private double gstAmount;
    private double consultationFee;
    
    private double platformFeePercentage; // e.g., 2.5%
    private double platformFee; // ✅ NEW — editable from UI
    
    private double finalCost;


 // 🔥 NEW PAYMENT FIELDS
    private String paymentType; // FULL_PAYMENT / PARTIAL_PAYMENT
    private double partialPaymentPercentage;
    private double partialAmount;
    private double dueAmount;
}
