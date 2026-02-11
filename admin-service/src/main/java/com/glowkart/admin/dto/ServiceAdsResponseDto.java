package com.glowkart.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ServiceAdsResponseDto {

    private String id;
    private String clinicId;     // ✅ NEW
    private String clinicName;   // ✅ NEW
    private String type;
    private String url;
    private String title;
    private String filename;
}
