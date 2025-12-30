package com.glowkart.booking.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class WalletServiceException extends RuntimeException {

    private final int statusCode;

    // Constructor with custom status code
    public WalletServiceException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    // Constructor using Spring's HttpStatus
    public WalletServiceException(String message, HttpStatus status) {
        super(message);
        this.statusCode = status.value();
    }
}
