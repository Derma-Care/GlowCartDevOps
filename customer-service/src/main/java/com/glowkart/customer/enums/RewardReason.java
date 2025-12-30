package com.glowkart.customer.enums;

public enum RewardReason {
    REGISTRATION_COMPLETED(100),
    REDEEMED_FOR_BOOKING(0);  // points can vary

    private final int defaultPoints;

    RewardReason(int defaultPoints) {
        this.defaultPoints = defaultPoints;
    }

    public int getDefaultPoints() {
        return defaultPoints;
    }
}

