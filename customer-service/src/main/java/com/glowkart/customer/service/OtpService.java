package com.glowkart.customer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    @Value("${twilio.accountSid}")
    private String accountSid;

    @Value("${twilio.authToken}")
    private String authToken;

    @Value("${twilio.fromPhone}")
    private String fromPhone;

    // Store OTP temporarily in memory (or use Redis for production)
    private final Map<String, String> otpStorage = new HashMap<>();
    private final Map<String, Long> otpExpiry = new HashMap<>();

    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 5;

    private final SecureRandom random = new SecureRandom();

    public OtpService() {}

    public void sendOtp(String mobile) {
        Twilio.init(accountSid, authToken);

        String otp = generateOtp();
        otpStorage.put(mobile, otp);
        otpExpiry.put(mobile, System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(OTP_VALIDITY_MINUTES));

        Message.creator(
                new com.twilio.type.PhoneNumber("+91" + mobile),
                new com.twilio.type.PhoneNumber(fromPhone),
                "Your OTP for GlowKart login is: " + otp
        ).create();
    }

    public boolean verifyOtp(String mobile, String otp) {
        String storedOtp = otpStorage.get(mobile);
        Long expiryTime = otpExpiry.get(mobile);

        if (storedOtp == null || expiryTime == null || System.currentTimeMillis() > expiryTime) {
            otpStorage.remove(mobile);
            otpExpiry.remove(mobile);
            return false; // OTP expired or not sent
        }

        boolean isValid = storedOtp.equals(otp);
        if (isValid) {
            otpStorage.remove(mobile);
            otpExpiry.remove(mobile);
        }

        return isValid;
    }

    private String generateOtp() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
