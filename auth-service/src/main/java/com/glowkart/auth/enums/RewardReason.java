package com.glowkart.auth.enums;

public enum RewardReason {
    REGISTRATION_COMPLETED(100),  // new customer reward
    REFERRAL_BONUS(200),          // referrer reward
    REDEEMED_FOR_BOOKING(0);

    private final int defaultPoints;

    RewardReason(int defaultPoints) {
        this.defaultPoints = defaultPoints;
    }

    public int getDefaultPoints() {
        return defaultPoints;
    }
}
