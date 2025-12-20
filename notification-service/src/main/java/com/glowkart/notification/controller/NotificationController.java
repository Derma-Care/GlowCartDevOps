package com.glowkart.notification.controller;

import com.glowkart.notification.model.AppNotification;
import com.glowkart.notification.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final NotificationRepository repository;

    public NotificationController(NotificationRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/notifications/{customerId}")
    public List<AppNotification> getNotifications(@PathVariable String customerId) {
        return repository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }
}
