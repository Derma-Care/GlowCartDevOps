package com.glowkart.booking.model;

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

    @Indexed(unique = true)
    private String bookingId;

    private String customerId;
    private String fullName;
    private String mobileNumber;

    private String clinicId;
    private String clinicName;
    private String clinicAddress;

    private String serviceId;
    private String serviceName;
    private String serviceType;

    private int rating;
    private String review;

    private String createdAt; // "2026-01-20T14:42:30Z"
}
