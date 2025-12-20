package com.glowkart.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String eventId;
    private String customerId;
    private String title;
    private String message;
    private String type;          // LOGIN, REWARD, OFFER
    private List<String> channels; // PUSH
    private String deviceToken;    // FCM device token
}
