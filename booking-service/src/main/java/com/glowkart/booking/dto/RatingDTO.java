package com.glowkart.booking.dto;

import lombok.Data;

@Data
public class RatingDTO {
    private String bookingId;
    private int rating;       // 1 to 5
    private String review;    // optional
}
