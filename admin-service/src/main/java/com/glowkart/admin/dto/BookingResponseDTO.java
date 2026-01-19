package com.glowkart.admin.dto;


import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingResponseDTO {

    private String bookingId;
    private String clinicId;

    private String clinicName;
    private String clinicAddress;
    private String customerId;
    private String fullName;
    private String city;
    private LocalDate dob;
//    private int age;
    private String ageLabel; // ✅ NEW
    private String gender;
    private String serviceId;
    private String serviceName;
    private String serviceType;   // PROCEDURE or PACKAGE
 // 🔥 PAYMENT
    private String paymentMode;   // ONLINE / CASH
    private String paymentType;   // FULL_PAYMENT / PARTIAL_PAYMENT

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

    // 🔥 PARTIAL PAYMENT BREAKUP
    private double partialPaymentPercentage;
    private double partialAmount;
    private double dueAmount;

    // NEW FIELD for redeemed wallet points
    private int redeemedPoints;
    
    private String status;
    private String paymentStatus;
    private String mobileNumber;
}

