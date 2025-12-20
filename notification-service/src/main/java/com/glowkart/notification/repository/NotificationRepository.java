package com.glowkart.notification.repository;

import com.glowkart.notification.model.AppNotification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<AppNotification, String> {

    List<AppNotification> findByCustomerIdOrderByCreatedAtDesc(String customerId);
}
