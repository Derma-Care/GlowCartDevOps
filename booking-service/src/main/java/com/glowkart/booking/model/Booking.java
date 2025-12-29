package com.glowkart.booking.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

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

    private String clinicId;
    private String clinicName;
    private String clinicAddress;

    private String serviceId;
    private String serviceName;
    private String serviceType;   // PROCEDURE or PACKAGE
    private String paymentType;   // ONLINE or CASH
    private String appointmentDate;

    // Pricing fields
    private double price;

 // Discount fields
    private double discount;                  // Optional: Offer discount %
    private double discountAmount;            // Offer discount amount
    private double discountedCost;            // Price after offer discount
    private double totalDiscountAmount;       // Total discount applied
    private double totalDiscountPercentage;   // Total discount %
    private double ngkDiscountAmount;         // NGK discount
    private double ngkDiscountPercentage;     // NGK discount %

    // Tax & GST
    private double taxPercentage;
    private double taxAmount;
    private double gst;
    private double gstAmount;

    private double consultationFee;
    private double finalAmount;

    // Booking status
    private String status;         // HOLD, CONFIRMED, CANCELLED, FAILED
    private String paymentStatus;  // PENDING, PAID, FAILED, NA

    private Instant createdAt;
    private Instant updatedAt;
}
