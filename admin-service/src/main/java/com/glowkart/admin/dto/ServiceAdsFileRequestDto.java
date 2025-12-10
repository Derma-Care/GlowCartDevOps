package com.glowkart.admin.dto;

import lombok.Data;

@Data
public class ServiceAdsFileRequestDto {
    private String type;      // image / video
    private String filename;  // original filename
    private String data;      // Base64-encoded file
    private String title;     // ad title
}
