package com.glowkart.procedure.dto;

import lombok.Data;

@Data
public class ClinicResponse {
    private String clinicId;
    private String name;
    private String address;
    private String status;  // optional, but useful
}
