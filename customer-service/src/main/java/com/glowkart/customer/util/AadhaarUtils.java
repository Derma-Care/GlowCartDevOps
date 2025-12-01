package com.glowkart.customer.util;

import javax.crypto.Mac;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class AadhaarUtils {

    private static final Logger logger = LoggerFactory.getLogger(AadhaarUtils.class);

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int ITERATIONS = 200_000;
    private static final int KEY_LENGTH = 256; // bits

    // Load peppers securely
    private static final String PEPPER = loadPepper("AADHAAR_PEPPER");
    private static final String LEGACY_PEPPER = loadPepper("AADHAAR_LEGACY_PEPPER");

    private AadhaarUtils() {}

    /** Secure pepper loader with production enforcement */
    private static String loadPepper(String name) {
        String pepper = System.getenv(name);

        if (pepper == null || pepper.length() < 32) {
            String profile = System.getenv("APP_PROFILE");

            if ("production".equalsIgnoreCase(profile)) {
                throw new IllegalStateException(name + " missing or too short for production.");
            }

            logger.warn("{} missing! Using temporary DEV pepper. DO NOT USE IN PROD.", name);
            return name + "_DEV_TEMPORARY_PEPPER_VALUE_123456789012345";
        }

        return pepper;
    }

    /** 32-byte secure salt */
    public static String generateSalt() {
        byte[] salt = new byte[32];
        RANDOM.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    /** Correct PBKDF2 hash using decoded Base64 salt */
    public static String hashAadhaar(String aadhaar, String saltBase64) {
        try {
            byte[] salt = Base64.getDecoder().decode(saltBase64);

            PBEKeySpec spec = new PBEKeySpec(
                    (aadhaar + PEPPER).toCharArray(),
                    salt,
                    ITERATIONS,
                    KEY_LENGTH
            );

            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = skf.generateSecret(spec).getEncoded();

            spec.clearPassword();
            return Base64.getEncoder().encodeToString(hash);

        } catch (Exception e) {
            throw new RuntimeException("Error hashing Aadhaar", e);
        }
    }

    /** Deterministic HMAC prehash (for duplicate detection) */
    public static String preHashAadhaar(String aadhaar) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(PEPPER.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getEncoder().encodeToString(mac.doFinal(aadhaar.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Error generating pre-hash", e);
        }
    }

    /** Legacy last4 PBKDF2 hashing */
    public static String secureLegacyPreHash(String last4, String saltBase64) {
        try {
            byte[] salt = Base64.getDecoder().decode(saltBase64);

            PBEKeySpec spec = new PBEKeySpec(
                    (last4 + LEGACY_PEPPER).toCharArray(),
                    salt,
                    ITERATIONS,
                    KEY_LENGTH
            );

            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = skf.generateSecret(spec).getEncoded();

            spec.clearPassword();
            return Base64.getEncoder().encodeToString(hash);

        } catch (Exception e) {
            throw new RuntimeException("Error hashing legacy Aadhaar", e);
        }
    }

    /** Random pre-hash when Aadhaar missing */
    public static String randomPreHash() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    /** Get last 4 digits */
    public static String getLast4Digits(String aadhaar) {
        if (!aadhaar.matches("\\d{12}"))
            throw new IllegalArgumentException("Invalid Aadhaar number");
        return aadhaar.substring(8);
    }

    /** Mask for display */
    public static String maskAadhaar(String last4) {
        return "********" + last4;
    }

    /** Constant-time comparison */
    public static boolean constantTimeEquals(String a, String b) {
        byte[] aBytes = a.getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(StandardCharsets.UTF_8);
        if (aBytes.length != bBytes.length) return false;

        int result = 0;
        for (int i = 0; i < aBytes.length; i++)
            result |= aBytes[i] ^ bBytes[i];

        return result == 0;
    }
}
