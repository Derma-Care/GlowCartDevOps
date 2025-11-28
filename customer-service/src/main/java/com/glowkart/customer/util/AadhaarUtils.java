package com.glowkart.customer.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class AadhaarUtils {

    public static String hashAadhaar(String aadhaar) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(aadhaar.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found");
        }
    }

    public static String getLast4Digits(String aadhaar) {
        if (aadhaar.length() != 12) throw new IllegalArgumentException("Invalid Aadhaar number");
        return aadhaar.substring(8);
    }

    public static String maskAadhaar(String last4) {
        return "********" + last4;
    }
}
