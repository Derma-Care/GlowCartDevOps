package com.glowkart.booking.dto;

import lombok.Data;

@Data
public class ProcedurePackageDTO {

    private String packageId;
    private String packageName;
    private String clinicId;

    private double price;
    private double totalDiscountAmount;
    private double totalDiscountPercentage;

    private double taxPercentage;
    private double taxAmount;

    private double gst;
    private double gstAmount;

    private double consultationFee;
    private double finalCost;
}
