package com.glowkart.procedure.exception;

import com.glowkart.procedure.dto.ApiResponse;
import com.glowkart.procedure.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleBadRequest(BadRequestException ex) {
        String summaryMessage = "Bad request occurred. ErrorCode: " + ex.getErrorCode();
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getErrorCode(),
                "Bad Request",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, summaryMessage, errorResponse));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleNotFound(ResourceNotFoundException ex) {
        String summaryMessage = "Resource not found. ErrorCode: " + ex.getErrorCode();
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getErrorCode(),
                "Not Found",
                ex.getMessage(),
                HttpStatus.NOT_FOUND.value(),
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, summaryMessage, errorResponse));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleDuplicate(DuplicateResourceException ex) {
        String summaryMessage = "Resource conflict. ErrorCode: " + ex.getErrorCode();
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getErrorCode(),
                "Conflict",
                ex.getMessage(),
                HttpStatus.CONFLICT.value(),
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiResponse<>(false, summaryMessage, errorResponse));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleValidationErrors(MethodArgumentNotValidException ex) {
        StringBuilder sb = new StringBuilder();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            sb.append(error.getDefaultMessage()).append("; ");
        }
        String message = sb.toString().trim();

        ErrorResponse errorResponse = new ErrorResponse(
                "VALIDATION_FAILED",
                "Bad Request",
                message,
                HttpStatus.BAD_REQUEST.value(),
                Instant.now()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, message, errorResponse));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleGeneric(Exception ex) {
        String summaryMessage = "Internal server error. ErrorCode: INTERNAL_ERROR";
        ErrorResponse errorResponse = new ErrorResponse(
                "INTERNAL_ERROR",
                "Internal Server Error",
                ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, summaryMessage, errorResponse));
    }
}
