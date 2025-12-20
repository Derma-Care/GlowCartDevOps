package com.glowkart.notification.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor // <-- ADD THIS
@AllArgsConstructor
public class NotificationEvent {
    private String eventId; 
    private String customerId;
    private String title;
    private String message;
    private String type; 
    private List<String> channels; 
    private String deviceToken; // single device token
}
