package com.glowkart.booking.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "booking_ratings")
public class BookingRating {

    @Id
    private String id;

    @Indexed(unique = true)  // ensures only 1 rating per booking
    private String bookingId;

    private String customerId;
    private String fullName;        // ✅ add
    private String mobileNumber;    // ✅ add
    private String clinicId;
    private String clinicName;       // ✅
    private String clinicAddress;    // ✅

    private String serviceId;
    private String serviceName;      // ✅
    private String serviceType;      // ✅

    private int rating;       // 1 to 5
    private String review;    // optional text

    private String createdAt; // store "2026-01-02" exactly
}
