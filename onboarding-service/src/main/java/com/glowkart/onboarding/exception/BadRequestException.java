package com.glowkart.onboarding.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String msg) { 
        super(msg);
    }
}
