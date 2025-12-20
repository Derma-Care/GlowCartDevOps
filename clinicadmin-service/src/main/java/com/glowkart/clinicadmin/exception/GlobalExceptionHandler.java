package com.glowkart.clinicadmin.exception;

import com.glowkart.clinicadmin.dto.ApiResponse;
import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle ResourceNotFoundException
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiResponse<Object> response = new ApiResponse<>(false,
                ex.getMessage(),
                null,
                HttpStatus.NOT_FOUND.value());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // Handle Feign 404 separately
    @ExceptionHandler(FeignException.NotFound.class)
    public ResponseEntity<ApiResponse<Object>> handleFeignNotFound(FeignException.NotFound ex) {
        ApiResponse<Object> response = new ApiResponse<>(false,
                "Clinic not found",
                null,
                HttpStatus.NOT_FOUND.value());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // Handle all other Feign exceptions
    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ApiResponse<Object>> handleFeignException(FeignException ex) {
        HttpStatus status = HttpStatus.resolve(ex.status());
        if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;

        ApiResponse<Object> response = new ApiResponse<>(false,
                "Error calling remote service: " + ex.getMessage(),
                null,
                status.value());
        return ResponseEntity.status(status).body(response);
    }

    // Handle all generic exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        ApiResponse<Object> response = new ApiResponse<>(false,
                "Internal Server Error: " + ex.getMessage(),
                null,
                HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
