package com.glowkart.notification.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class AppNotification {

    @Id
    private String eventId; // Use eventId from NotificationEvent for idempotency

    private String customerId;
    private String title;
    private String message;
    private String type; // REWARD, REMINDER, OFFER
    private LocalDateTime createdAt;
}
