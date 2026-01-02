package com.glowkart.booking.model;

import java.time.Instant;

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
    private String clinicId;
    private String serviceId;

    private int rating;       // 1 to 5
    private String review;    // optional text

    private Instant createdAt;
}
