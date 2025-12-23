package com.glowkart.notification.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FcmService {

    public void sendToDevice(String deviceToken, String title, String body) {

        if (deviceToken == null || deviceToken.isBlank()) {
            log.warn("FCM skipped: deviceToken is null or empty");
            return;
        }

        try {
            Message message = Message.builder()
                    .setToken(deviceToken)
                    .setNotification(
                            Notification.builder()
                                    .setTitle(title)
                                    .setBody(body)
                                    .build()
                    )
                    .build();

            FirebaseMessaging.getInstance().send(message);

            log.info("FCM sent successfully to deviceToken={}", mask(deviceToken));

        } catch (Exception e) {
            log.error("FCM failed for deviceToken={} error={}", mask(deviceToken), e.getMessage(), e);
        }
    }

    /**
     * Masks device token for logging
     */
    private String mask(String token) {
        return token.length() > 10
                ? token.substring(0, 6) + "****" + token.substring(token.length() - 4)
                : "****";
    }
}
