package com.glowkart.booking.exception;

import com.glowkart.booking.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle ResponseStatusException (like 404 Booking not found)
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Object>> handleResponseStatusException(ResponseStatusException ex) {
        log.error("ResponseStatusException: {}", ex.getReason(), ex);
        return ResponseEntity.status(ex.getStatusCode())
                .body(ApiResponse.of(false, ex.getReason(), null, ex.getStatusCode().value()));
    }

    // Handle validation errors (400)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("IllegalArgumentException: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.of(false, ex.getMessage(), null, 400));
    }

    // Handle wallet-specific exceptions with fixed 500
    @ExceptionHandler(WalletOperationException.class)
    public ResponseEntity<ApiResponse<Object>> handleWalletOperation(WalletOperationException ex) {
        log.error("WalletOperationException: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.of(false, ex.getMessage(), null, 500));
    }

    // Handle wallet service exceptions from Feign with dynamic status
    @ExceptionHandler(WalletServiceException.class)
    public ResponseEntity<ApiResponse<Object>> handleWalletServiceException(WalletServiceException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(ApiResponse.of(false, ex.getMessage(), null, ex.getStatusCode()));
    }



    // Catch-all for unexpected errors (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(Exception ex) {
        log.error("Unhandled exception occurred", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.of(false, "Internal server error: " + ex.getMessage(), null, 500));
    }
}
