package com.glowkart.admin.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowkart.admin.dto.ApiResponse;
import feign.FeignException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final ObjectMapper mapper = new ObjectMapper();

    // Handle Feign errors (errors returned from procedure-service)
    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ApiResponse<Object>> handleFeignException(FeignException ex) {
        try {
            // Extract the exact JSON body returned by procedure-service
            String json = ex.contentUTF8();

            // Convert JSON to ApiResponse
            ApiResponse<?> remoteResponse = mapper.readValue(json, ApiResponse.class);

            // Return SAME response with SAME HTTP status
            return ResponseEntity
                    .status(ex.status())
                    .body(new ApiResponse<>(
                            remoteResponse.isSuccess(),
                            remoteResponse.getMessage(),
                            remoteResponse.getData()
                    ));
        } catch (Exception parseError) {
            // Fallback if JSON parsing fails
            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(new ApiResponse<>(false, "Failed to parse remote service error", null));
        }
    }

    // Handle custom ProcedureServiceException (used inside admin service)
    @ExceptionHandler(ProcedureServiceException.class)
    public ResponseEntity<ApiResponse<Object>> handleProcedureServiceException(ProcedureServiceException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(new ApiResponse<>(false, ex.getMessage(), ex.getData()));
    }

    // Handle validation errors from @RequestBody
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .findFirst()
                .orElse("Validation error");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, errorMessage, null));
    }

    // Handle @PathVariable / @RequestParam validation errors
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(ConstraintViolationException ex) {
        String errorMessage = ex.getConstraintViolations()
                .stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .findFirst()
                .orElse("Constraint violation");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, errorMessage, null));
    }

    // Catch-all for unexpected exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAll(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Internal server error: " + ex.getMessage(), null));
    }
}
