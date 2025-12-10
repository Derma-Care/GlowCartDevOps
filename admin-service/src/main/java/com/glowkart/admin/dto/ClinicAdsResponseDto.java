package com.glowkart.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClinicAdsResponseDto {
    private String id;        // DB ID
    private String type;      // image / video
    private String url;       // presigned URL
    private String title;     // ad title
    private String filename;  // original filename
}
