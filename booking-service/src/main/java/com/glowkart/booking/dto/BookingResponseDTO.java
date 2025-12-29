package com.glowkart.booking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingResponseDTO {

    private String bookingId;

    private String clinicName;
    private String clinicAddress;

    private String serviceId;
    private String serviceName;
    private String serviceType;   // PROCEDURE or PACKAGE
    private String paymentType;   // ONLINE or CASH

    private String appointmentDate;

    private double price;
    private double discount;                  // Offer discount %
    private double discountAmount;            // Offer discount amount
    private double discountedCost;            // Price after offer discount
    private double totalDiscountAmount;
    private double totalDiscountPercentage;
    private double ngkDiscount;               // NGK discount amount
    private double ngkDiscountPercentage;     // NGK discount %

    private double taxPercentage;
    private double taxAmount;
    private double gst;
    private double gstAmount;
    private double consultationFee;
    private double finalAmount;

    private String status;
    private String paymentStatus;
    private String mobileNumber;
}

