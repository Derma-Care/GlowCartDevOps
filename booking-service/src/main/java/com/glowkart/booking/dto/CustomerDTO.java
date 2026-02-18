package com.glowkart.booking.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class CustomerDTO {
    private String customerId;
    private String deviceToken;

    private String mobile;
    private String fullName;
    private String city;
    private LocalDate dob;
    private String gender;
}

