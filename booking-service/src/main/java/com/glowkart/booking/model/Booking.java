package com.glowkart.booking.model;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.glowkart.booking.dto.BookingProcedureDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String _id;

    private String bookingId;

    private String customerId;
    private String mobileNumber;

    private String fullName;
    private String city;
    private LocalDate dob;
    private String gender;

    private String clinicId;
    private String clinicName;
    private String clinicAddress;

    private String serviceId;
    private String serviceName;
    private String serviceType;   // PROCEDURE or PACKAGE

    // ✅ Snapshot of package procedures
    private List<BookingProcedureDTO> procedures;

    // 🔥 PAYMENT MODE (HOW user pays)
    private String paymentMode;   // ONLINE / CASH

    // 🔥 PAYMENT TYPE (HOW MUCH user pays)
    private String paymentType;   // FULL_PAYMENT / PARTIAL_PAYMENT

    private String appointmentDate;

    // ================= PRICING =================
    private double price;

    // Discounts
    private double discount;                  
    private double discountAmount;            
    private double discountedCost;            
    private double totalDiscountAmount;       
    private double totalDiscountPercentage;   
    private double ngkDiscountAmount;         
    private double ngkDiscountPercentage;     

    // Tax & GST
    private double taxPercentage;
    private double taxAmount;
    private double gst;
    private double gstAmount;

    private double consultationFee;
    
 // Platform fee
    private double platformFeePercentage;
    private double platformFee;
    private double finalAmount;

    // 🔥 PARTIAL PAYMENT BREAKUP
    private double partialPaymentPercentage;
    private double partialAmount;
    private double dueAmount;

    // Wallet
    private int redeemedPoints;

    // Status
    private String status;         // HOLD, CONFIRMED, CANCELLED, FAILED
    private String paymentStatus;  // PENDING, PAID, PARTIALLY_PAID, FAILED, NA

    private String createdAt;
    private String updatedAt;

    @JsonProperty("isRated")
    private boolean isRated;
}
