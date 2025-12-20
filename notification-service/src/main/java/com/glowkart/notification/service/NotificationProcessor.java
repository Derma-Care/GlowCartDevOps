package com.glowkart.notification.service;

import com.glowkart.notification.model.AppNotification;
import com.glowkart.notification.model.NotificationEvent;
import com.glowkart.notification.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class NotificationProcessor {

    private final FcmService fcmService;
    private final NotificationRepository repository;

    public NotificationProcessor(FcmService fcmService, NotificationRepository repository) {
        this.fcmService = fcmService;
        this.repository = repository;
    }

    public void process(NotificationEvent event) throws Exception {

        // 1️⃣ Idempotency
        if (repository.existsById(event.getEventId())) {
            log.info("Notification already processed: eventId={}", event.getEventId());
            return;
        }

        // 2️⃣ Save to MongoDB
        AppNotification notification = new AppNotification(
                event.getEventId(),
                event.getCustomerId(),
                event.getTitle(),
                event.getMessage(),
                event.getType(),
                LocalDateTime.now()
        );

        repository.save(notification);
        log.info("Saved notification: eventId={} customerId={}",
                event.getEventId(), event.getCustomerId());

        // 3️⃣ PUSH notifications
        if (event.getChannels() != null && event.getChannels().contains("PUSH")) {
            fcmService.sendToDevice(
                    event.getDeviceToken(),
                    event.getTitle(),
                    event.getMessage()
            );
        }
     
        // 4️⃣ TODO: Add EMAIL / SMS channels if needed
    }
}
