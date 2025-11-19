package com.glowkart.admin.util;

import java.util.Map;
import java.util.UUID;

public class CredentialGenerator {
    public static Map<String, String> generate() {
        String username = "clinic_" + UUID.randomUUID().toString().substring(0, 6);
        String password = UUID.randomUUID().toString().substring(0, 8);
        return Map.of("username", username, "password", password);
    }
}
