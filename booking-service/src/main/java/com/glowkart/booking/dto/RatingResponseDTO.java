package com.glowkart.booking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RatingResponseDTO {

    private String bookingId;
    private String customerId;
    private String fullName;
    private String mobileNumber;

    private String clinicId;
    private String clinicName;
    private String clinicAddress;

    private String serviceId;
    private String serviceName;
    private String serviceType;

    private int rating;
    private String review;

    private String createdAt; // "2026-01-20T14:42:30Z"
}
