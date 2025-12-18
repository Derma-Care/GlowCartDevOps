package com.glowkart.customer.service;

import com.glowkart.customer.exception.OtpCooldownException;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    @Value("${twilio.accountSid}")
    private String accountSid;

    @Value("${twilio.authToken}")
    private String authToken;

    @Value("${twilio.fromPhone}")
    private String fromPhone;

    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final Map<String, Long> otpExpiry = new ConcurrentHashMap<>();
    private final Map<String, Long> lastSentTime = new ConcurrentHashMap<>();

    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 30;

    private final SecureRandom random = new SecureRandom();

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    /**
     * Send or resend OTP
     */
    public void sendOtp(String mobile) {

        long now = System.currentTimeMillis();

        // Cooldown protection
        Long lastSent = lastSentTime.get(mobile);
        if (lastSent != null &&
            now - lastSent < TimeUnit.SECONDS.toMillis(RESEND_COOLDOWN_SECONDS)) {
            throw new OtpCooldownException(
                    "Please wait " + RESEND_COOLDOWN_SECONDS + " seconds before resending OTP"
            );
        }

        String otp;
        Long expiry = otpExpiry.get(mobile);

        // Reuse OTP if still valid
        if (expiry != null && now < expiry && otpStorage.containsKey(mobile)) {
            otp = otpStorage.get(mobile);
        } else {
            otp = generateOtp();
            otpStorage.put(mobile, otp);
            otpExpiry.put(mobile, now + TimeUnit.MINUTES.toMillis(OTP_VALIDITY_MINUTES));
        }

        lastSentTime.put(mobile, now);

        // Send SMS via Twilio
        Message.creator(
                new PhoneNumber("+91" + mobile),
                new PhoneNumber(fromPhone),
                "Your GlowKart OTP is: " + otp + ". Valid for 5 minutes."
        ).create();
    }

    /**
     * Verify OTP
     */
    public boolean verifyOtp(String mobile, String otp) {
        String storedOtp = otpStorage.get(mobile);
        Long expiryTime = otpExpiry.get(mobile);

        if (storedOtp == null || expiryTime == null) {
            return false;
        }

        if (System.currentTimeMillis() > expiryTime) {
            clearOtp(mobile);
            return false;
        }

        boolean valid = storedOtp.equals(otp);
        if (valid) {
            clearOtp(mobile);
        }
        return valid;
    }

    private void clearOtp(String mobile) {
        otpStorage.remove(mobile);
        otpExpiry.remove(mobile);
        lastSentTime.remove(mobile);
    }

    private String generateOtp() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    /**
     * Cleanup expired OTPs every 1 minute
     */
    @Scheduled(fixedRate = 60_000)
    public void cleanupExpiredOtps() {
        long now = System.currentTimeMillis();
        otpExpiry.entrySet().removeIf(entry -> {
            String mobile = entry.getKey();
            Long expiryTime = entry.getValue();
            if (expiryTime != null && now > expiryTime) {
                otpStorage.remove(mobile);
                lastSentTime.remove(mobile);
                return true;
            }
            return false;
        });
    }
}
