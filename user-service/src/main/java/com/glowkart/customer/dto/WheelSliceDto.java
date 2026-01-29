package com.glowkart.customer.dto;

import lombok.Data;

@Data
public class WheelSliceDto {
    private String id;
    private String option;     // e.g., "10% off"
    private String src;        // image/base64 string
}
