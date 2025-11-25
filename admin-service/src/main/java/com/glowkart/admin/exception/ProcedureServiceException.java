package com.glowkart.admin.exception;

public class ProcedureServiceException extends RuntimeException {
    private final int status;
    private final Object data;

    public ProcedureServiceException(String message, int status, Object data) {
        super(message);
        this.status = status;
        this.data = data;
    }

    public int getStatus() { return status; }
    public Object getData() { return data; }
}
