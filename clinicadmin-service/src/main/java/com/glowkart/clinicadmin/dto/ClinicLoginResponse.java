package com.glowkart.clinicadmin.dto;

import lombok.Data;

@Data
public class ClinicLoginResponse {
    private String message;
    private String clinicId;
    private String name;
    private String status;
}
