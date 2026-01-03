package com.glowkart.admin.dto;

import lombok.Data;
import java.util.List;

@Data
public class ClinicRatingsResponseDTO {
    private String clinicId;
    private double averageRating;
    private int totalRatings;
    private List<RatingResponseDTO> ratings;
}

