package com.glowkart.admin.util;

import java.util.Map;
import java.util.UUID;

public class CredentialGenerator {


    /**
     * Generates login credentials for the clinic.
     * @return Map with "username" and "password"
     */
    public static Map<String, String> generateLoginCredentials() {
        String username = "clinic_" + UUID.randomUUID().toString().substring(0, 6);
        String password = UUID.randomUUID().toString().substring(0, 8);
        return Map.of("username", username, "password", password);
    }

    /**
     * Generates payout credentials for the clinic.
     * @return Map with "payoutUsername" and "payoutPassword"
     */
    public static Map<String, String> generatePayoutCredentials() {
        String payoutUsername = "payout_" + UUID.randomUUID().toString().substring(0, 6);
        String payoutPassword = UUID.randomUUID().toString().substring(0, 8);
        return Map.of("payoutUsername", payoutUsername, "payoutPassword", payoutPassword);
    }

	
}
