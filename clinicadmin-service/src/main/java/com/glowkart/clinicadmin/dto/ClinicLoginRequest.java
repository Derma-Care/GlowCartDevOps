package com.glowkart.clinicadmin.dto;

import lombok.Data;

@Data
public class ClinicLoginRequest {
    private String username;
    private String password;
}
