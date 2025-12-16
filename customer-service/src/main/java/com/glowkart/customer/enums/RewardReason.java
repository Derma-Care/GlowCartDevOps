package com.glowkart.customer.enums;

public enum RewardReason {
    REGISTRATION_COMPLETED(100);

    private final int defaultPoints;

    RewardReason(int defaultPoints) {
        this.defaultPoints = defaultPoints;
    }

    public int getDefaultPoints() {
        return defaultPoints;
    }
}

