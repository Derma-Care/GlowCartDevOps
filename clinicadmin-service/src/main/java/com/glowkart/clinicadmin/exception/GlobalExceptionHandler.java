package com.glowkart.clinicadmin.exception;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowkart.clinicadmin.dto.ApiResponse;
import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ApiResponse<Object>> handleFeignException(FeignException ex) {
        ApiResponse<Object> response;

        try {
            String body = ex.contentUTF8();

            if (body != null && !body.isEmpty()) {
                body = body.trim();

                // Handle array-wrapped JSON: [ {...} ]
                if (body.startsWith("[") && body.endsWith("]")) {
                    body = body.substring(1, body.length() - 1);
                }

                // Parse the JSON into ApiResponse<Object>
                response = objectMapper.readValue(body, new TypeReference<ApiResponse<Object>>() {});
            } else {
                response = new ApiResponse<>(false, "No response body from service", null);
            }
        } catch (Exception e) {
            // Fallback: parsing failed
            response = new ApiResponse<>(false,
                    "Error parsing service response: " + e.getMessage(),
                    null);
        }

        // Use the original HTTP status from Feign
        HttpStatus status = HttpStatus.resolve(ex.status());
        if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        ApiResponse<Object> response = new ApiResponse<>(false,
                "Internal Server Error: " + ex.getMessage(),
                null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
