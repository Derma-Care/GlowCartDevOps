package com.glowkart.booking.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingRatingResponseDTO {

    private String bookingId;
    
    private String clinicId;
    private String clinicName;
    private String clinicAddress;
//    private String hospitalLogo;
    private String customerId;
    private String fullName;
    private String city;
    private LocalDate dob;
    private String ageLabel;
    private String gender;

    private String serviceId;
    private String serviceName;
    private String serviceType;

    private String appointmentDate;
    private String mobileNumber;
    @JsonProperty("isRated")
    private boolean isRated; // ✅ Indicates if booking has already been rated
}
