package com.glowkart.customer.util;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class AadhaarUtils {

    private static final Logger log = LoggerFactory.getLogger(AadhaarUtils.class);

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int ITERATIONS = 200_000;
    private static final int KEY_LENGTH = 256; // bits

    private static final String LEGACY_PEPPER = "LEGACY_ONLY_PEPPER";

    // Fallback pepper (for local/dev only – avoids crashes)
    private static final String DEFAULT_FALLBACK_PEPPER =
            "R8k39sD93kf02lsPwQx91NfLzXePqT7A"; // 32+ chars

    private static final String PEPPER = loadPepper();

    private AadhaarUtils() {}

    /**
     * Load pepper from environment OR fall back to safe default.
     */
    private static String loadPepper() {
        try {
            String pepper = System.getenv("AADHAAR_PEPPER");

            if (pepper == null || pepper.length() < 32) {
                log.warn("⚠ AADHAAR_PEPPER not set or too short. Using fallback pepper (DEV MODE).");
                return DEFAULT_FALLBACK_PEPPER;
            }

            return pepper;

        } catch (Exception e) {
            log.error("❌ Failed loading AADHAAR_PEPPER, using fallback.", e);
            return DEFAULT_FALLBACK_PEPPER;
        }
    }

    /** Hash Aadhaar using PBKDF2 + salt + pepper */
    public static String hashAadhaar(String aadhaar, String salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(
                    (aadhaar + PEPPER).toCharArray(),
                    salt.getBytes(StandardCharsets.UTF_8),
                    ITERATIONS,
                    KEY_LENGTH
            );
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = skf.generateSecret(spec).getEncoded();
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing Aadhaar", e);
        }
    }

    /** Deterministic pre-hash for duplicate detection */
    public static String preHashAadhaar(String aadhaar) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((aadhaar + PEPPER).getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error pre-hashing Aadhaar", e);
        }
    }

    /** Legacy pre-hash using last 4 digits */
    public static String legacyPreHash(String last4) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((last4 + LEGACY_PEPPER).getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error pre-hashing legacy Aadhaar", e);
        }
    }

    /** Generate secure 32-byte salt */
    public static String generateSalt() {
        byte[] salt = new byte[32];
        RANDOM.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    /** Return last 4 digits of Aadhaar */
    public static String getLast4Digits(String aadhaar) {
        if (!aadhaar.matches("\\d{12}"))
            throw new IllegalArgumentException("Invalid Aadhaar number");
        return aadhaar.substring(8);
    }

    /** Return masked Aadhaar for display */
    public static String maskAadhaar(String last4) {
        return "********" + last4;
    }

    /** Constant-time comparison to prevent timing attacks */
    public static boolean constantTimeEquals(String a, String b) {
        byte[] aBytes = a.getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(StandardCharsets.UTF_8);
        if (aBytes.length != bBytes.length) return false;
        int result = 0;
        for (int i = 0; i < aBytes.length; i++) {
            result |= aBytes[i] ^ bBytes[i];
        }
        return result == 0;
    }

    /** Generate random pre-hash for users without Aadhaar */
    public static String randomPreHash() {
        byte[] randomBytes = new byte[32];
        RANDOM.nextBytes(randomBytes);
        return Base64.getEncoder().encodeToString(randomBytes);
    }
}
