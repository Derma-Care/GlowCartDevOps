package com.glowkart.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.time.ZoneId;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;       
    private String message;        
    private T data;                
    private int statusCode;        
    private OffsetDateTime timestamp;     

    // Builder helper to automatically set timestamp in IST
    public static <T> ApiResponse<T> of(boolean success, String message, T data, int statusCode) {
        return ApiResponse.<T>builder()
                .success(success)
                .message(message)
                .data(data)
                .statusCode(statusCode)
                .timestamp(OffsetDateTime.now(ZoneId.of("Asia/Kolkata"))) // IST
                .build();
    }
}
