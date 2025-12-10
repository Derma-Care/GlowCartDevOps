package com.glowkart.admin.dto;



import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardAdsResponseDto {
    private String id;        // DB ID of the ad
    private String type;      // image / video
    private String url;       // Presigned URL for frontend
    private String title;     // new title field
    private String filename;  // original filename
}

