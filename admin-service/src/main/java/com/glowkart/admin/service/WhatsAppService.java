package com.glowkart.admin.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class WhatsAppService {

    private final Logger logger = LoggerFactory.getLogger(WhatsAppService.class);

    private final String accountSid;
    private final String authToken;
    private final String fromNumber;

    public WhatsAppService(Environment env) {
        this.accountSid = env.getProperty("twilio.account-sid");
        this.authToken = env.getProperty("twilio.auth-token");
        this.fromNumber = env.getProperty("twilio.whatsapp-from");
    }

    @PostConstruct
    public void init() {
        if (accountSid == null || authToken == null || fromNumber == null) {
            logger.warn("Twilio credentials missing.");
        } else {
            Twilio.init(accountSid, authToken);
            logger.info("Twilio initialized.");
        }
    }

    public void sendWhatsApp(String to, Map<String, String> data) {
        if (to == null || to.isBlank()) {
            logger.warn("WhatsApp not sent: blank number");
            return;
        }

        try {
            Message.creator(
                    new PhoneNumber("whatsapp:" + to),
                    new PhoneNumber("whatsapp:" + fromNumber),
                    buildMessageBody(data)
            ).create();

            logger.info("WhatsApp sent to {}", to);
        } catch (Exception e) {
            logger.error("WhatsApp failed to {}: {}", to, e.getMessage(), e);
        }
    }

    private String buildMessageBody(Map<String, String> data) {

        String otpType = data.get("otpType");

        StringBuilder body = new StringBuilder();

        body.append("Hello,\n\n");

        if ("PAYOUT_PASSWORD_RESET".equals(otpType)) {
            body.append("Payout Password Reset OTP\n\n");
        } else if ("CLINIC_PASSWORD_RESET".equals(otpType)) {
            body.append("Clinic Login Password Reset OTP\n\n");
        }

        body.append(data.getOrDefault("message", "")).append("\n\n");

        body.append("Regards,\nGlowKart Team");

        return body.toString();
    }
}
