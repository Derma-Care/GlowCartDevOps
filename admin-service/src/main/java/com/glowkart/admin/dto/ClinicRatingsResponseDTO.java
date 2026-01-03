package com.glowkart.admin.dto;

import lombok.Data;
import java.util.List;

@Data
public class ClinicRatingsResponseDTO {
    private String clinicId;
    private Double averageRating;   // ✅ FIX
    private int totalRatings;
    private List<RatingResponseDTO> ratings;
}
