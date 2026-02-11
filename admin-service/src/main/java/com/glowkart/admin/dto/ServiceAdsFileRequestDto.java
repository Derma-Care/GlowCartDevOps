package com.glowkart.admin.dto;

import lombok.Data;

@Data
public class ServiceAdsFileRequestDto {

    private String clinicId;   // ✅ REQUIRED
    private String type;
    private String filename;
    private String data;
    private String title;
}
