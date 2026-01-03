package com.glowkart.clinicadmin.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ClinicRatingsResponseDTO {

    private String clinicId;
    private double averageRating;
    private int totalRatings;
    private List<RatingResponseDTO> ratings;
}
