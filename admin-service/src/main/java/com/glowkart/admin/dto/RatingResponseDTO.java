package com.glowkart.admin.dto;


import lombok.Data;

@Data
public class RatingResponseDTO {
    private String bookingId;
    private int rating;
    private String review;
    private String createdAt;
}

