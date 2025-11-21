package com.glowkart.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClinicLoginResponse {

    private String message;
    private String clinicId;
    private String name;
    private String status;
}
