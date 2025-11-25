package com.glowkart.customer.exception;

import com.glowkart.customer.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ===== Handle Validation Errors (@Valid) =====
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
	        MethodArgumentNotValidException ex) {

	    Map<String, String> errors = new HashMap<>();

	    ex.getBindingResult().getFieldErrors().forEach(error ->
	            errors.put(error.getField(), error.getDefaultMessage())
	    );

	    ApiResponse<Map<String, String>> response =
	            new ApiResponse<>(false, "Validation failed", errors);

	    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}



    // ===== Handle Runtime Exceptions (like duplicates) =====
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<String>> handleRuntimeExceptions(RuntimeException ex) {

        ApiResponse<String> response =
                new ApiResponse<>(false, ex.getMessage(), null);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }


    // ===== Catch Any Other Unexpected Errors =====
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<String>> handleGeneralExceptions(Exception ex) {

        ApiResponse<String> response =
                new ApiResponse<>(false, "Something went wrong!", null);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
